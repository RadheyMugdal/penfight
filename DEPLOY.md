# Pen Fight — Deployment Plan

Target topology: **web app on Vercel (Hobby, free)**, **realtime WebSocket server on Cloudflare Workers + Durable Objects (free)**, web served at **penfight.radheymugdal.com**.

| Component                      | Where                                      | URL                                                          |
| ------------------------------ | ------------------------------------------ | ------------------------------------------------------------ |
| `apps/web`                     | Vercel project (Hobby)                     | `https://penfight.radheymugdal.com`                          |
| `packages/api` realtime server | Cloudflare Worker + Durable Object (free)  | `https://penfight-realtime.<your-subdomain>.workers.dev`     |

## Why this split

- Vercel WebSockets (beta) would cap connection lifetime by function max duration — **300 s on Hobby** — and reconnects can land on a *different* function instance, splitting the in-memory rooms. Not suitable here.
- The realtime server (`packages/api/src/realtime-server.ts`) must be a single always-effective state holder so reconnects always rejoin the same room. A **Durable Object** is Cloudflare's single-threaded, always-effective singleton — a exact behavioral match for the current Bun server, at $0 (free plan includes Durable Objects, 100k DO requests/day; WebSocket **Hibernation API** keeps idle sockets open without burning anything).
- Message size cap (1 MB) and free-tier request volume are irrelevant at classroom/game scale; the Phoenix protocol payloads here are all tiny.
- Alternative considered: Fly.io (~$2–3/mo, zero code changes). Rejected in favor of $0.

The realtime server has **zero runtime deps** and speaks the Supabase/Phoenix Channel protocol (`phx_join`, `presence`, `broadcast`, heartbeat at path `/realtime/v1/websocket`) — a direct port to a Hibernation-API DO.

---

## Phase 0 — One-time tooling & auth

```powershell
# Vercel CLI (login opens browser)
bunx vercel login

# Cloudflare account + wrangler
# sign up free at dash.cloudflare.com, then:
bunx wrangler login
bunx wrangler whoami   # confirm account
```

Then from the repo root:

```powershell
bun run deploy:setup     # bunx vercel link — creates .vercel, links project
```

Afterwards verify the linked project exists (`.vercel` folder) before proceeding to Phase 5.

## Phase 1 — Web app on Vercel

1. **vercel.json** already correct for this topology — one `web` service + catch-all rewrite; no realtime service is added (realtime lives on Cloudflare). No changes needed.
2. **Database (Neon Postgres)**: create a project at [neon.tech](https://neon.tech) (free tier is fine for Hobby; pick the region closest to your players, e.g. Mumbai/Singapore).
   - Copy the **pooled** connection string (Console → Dashboard → Connection string → toggle "Pooled connection", so the host contains `-pooler`). Vercel Functions are serverless — without PgBouncer pooling each invocation opens its own connections and you'll exhaust Neon's connection limits fast.
   - The string must include `?sslmode=require` (Neon's default copy already does).
   - `packages/db` is `drizzle-orm/node-postgres` + `pg` — no driver changes needed.
3. **Migrate against Neon** (migrations already live in `packages/db/src/migrations`):

   ```powershell
   # Put the Neon pooled URL into the DATABASE_URL used by packages/db
   # (packages/db pulls it via varlock from apps/web/.env — set the prod value there)
   bun run db:migrate     # drizzle-kit migrate → applies to Neon
   bun run db:studio      # optional: eyeball the tables on Neon
   ```

   Gotcha if you later see `prepared statement … already exists` errors: transaction-mode pooling (Neon pooler) conflicts with `pg`'s implicit prepared statements — fix by constructing the client with `prepare: false` in `packages/db/src/index.ts` (drizzle accepts pg client options). Try without it first.
4. **Env vars**: with prod values in `apps/web/.env` (Neon `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`/`SECRET`; schema declares them, varlock-encrypted), then:

   ```powershell
   bun run env:production   # syncs declared keys from apps/web/.env to Vercel prod env
   ```

   The sync script warns if values look like localhost — Neon's URL won't trigger it.
   `BETTER_AUTH_URL`/`CORS_ORIGIN`/`NODE_ENV` are intentionally skipped — `BETTER_AUTH_URL` resolves automatically to `$VERCEL_ORIGIN`
   (`$VERCEL_ENV`/`$VERCEL_PROJECT_PRODUCTION_URL` system vars provided on Vercel, defaulting from the `.env.schema`).
5. **Region**: after linking, set Project → Settings → Functions → Region to **bom1** (Mumbai), close to users and Neon.
6. **First deploy & check**:

   ```powershell
   bun run deploy:prod      # bunx vercel deploy --prod
   ```

### Better Auth / Google OAuth (Step 3C)

`BETTER_AUTH_URL` self-resolves to `$VERCEL_ORIGIN`, and in production that resolves itself to `$VERCEL_PROJECT_PRODUCTION_URL` + the project's production domain. After attaching `penfight.radheymugdal.com` in Step 5D (below), the URL will be
`https://penfight.radheymugdal.com/process from the app server.

Google Cloud Console → OAuth client → add authorized redirect URI:

```
https://penfight.radheymugdal.com/api/auth/callback/google
```

(Keep the existing localhost dev callback too.)

CORS not required — the page and WebSocket thus go through after public DNS propagation.

## Phase 2 — Realtime server port to Cloudflare Durable Object

Create in `packages/api` (keeps realtime logic colocated; local Bun dev path stays untouched):

### `packages/api/wrangler.jsonc`

```jsonc
{
  "name": "penfight-realtime",
  "main": "src/realtime-worker.ts",
  "compatibility_date": "2026-10-01",
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [{ "name": "REALTIME", "class_name": "RealtimeRoom" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["RealtimeRoom"] }]
}
```

### `packages/api/src/realtime-worker.ts` — 1:1 port

- Worker `default` handler: on `req.header("Upgrade") === "websocket"` requests (any path), forward the request to `env.REALTIME.get(idFromName("global")).fetch(request)`.
- `RealtimeRoom` DO replicates the Bun server byte-for-byte from `realtime-server.ts`:
  - accept the socket with the **Hibernation API** (`this.ctx.acceptWebSocket(server)`) so idle sockets persist free of charge;
  - per-socket state (`connId`, joined topics, current presence per topic) stored via `serializeAttachment()` so it survives hibernation;
  - the server-side global maps (`rooms`, `clientsByTopic`) rebuilt from socket attachments on each wake (`getWebSockets()` + attachment hydration — hibernation semantics);
  - same handlers: `heartbeat` → `phx_reply ok`; `phx_join` → ack + `presence_state`; `presence track` → seat assignment (0 = host, lowest free 1–5 for guests) + full state + `presence_diff`; `broadcast` → fan-out to the topic, excluding the sender;
  - `webSocketClose` → same leave/cleanup + `presence_diff` leave broadcast logic.

Deploy:

```powershell
cd packages/api
bunx wrangler deploy
```

Output includes the final URL: `https://penfight-realtime.<your-subdomain>.workers.dev` — that's the production endpoint used in Phase 3. (First `wrangler deploy` on a new account may prompt to register the DO migration; just re-run the deploy.)

Free-plan budget check: each inbound/outbound WS message counts as a DO request when the DO is awake. With hibernation, heartbeat-only quiet rooms wake on messages only — 100k requests/day is orders of magnitude beyond school-game traffic. If you ever see `no more than 10,000 distinct DO …` style hard-free-limit errors, it's time to shard by room id (`idFromName(topic)`) — keep as a later optimization, not now, since one connection may join multiple topics.

## Phase 3 — Point the game client at the realtime host

The client bundle hardcodes its WS endpoint:

```
apps/web/public/assets/groupMain-DWtBWKAW.js  (line ~1045)
  const to = `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.hostname}:3002/realtime/v1/websocket`,
```

Replace with a localhost-aware, prod constant (fill in your workers.dev subdomain from Phase 2's deploy output):

```js
const to = location.hostname === "localhost"
  ? `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.hostname}:3002/realtime/v1/websocket`
  : "wss://penfight-realtime.<your-subdomain>.workers.dev/realtime/v1/websocket",
```

- Desktop `http://localhost` and the current setup remain in tact.
- Don't rename the file (hash suffix baked into `src/app/page.tsx` / `src/app/desk/[code]/page.tsx` via `src="/assets/index-DyrlfgZ-.js"` which loads `groupMain-*`) — cosmetic only.
- If the file turns out to have been rebuilt since the hash changed, apply the same edit where the pattern above lives in whatever bundle it moved to.

## Phase 4 — Domains

### 4A. `penfight.radheymugdal.com` → Vercel project

`radheymugdal.com` is already a verified domain in your Vercel account, so a subdomain just attaches — no DNS record needed:

- Dashboard: Project → Settings → Domains → **Add** `penfight.radheymugdal.com`, assign to **Production** (or CLI):

  ```powershell
  bunx vercel alias set <prod-deployment-url> penfight.radheymugdal.com
  ```

Afterwards, in Project → Settings → Domains, `penfight.radheymugdal.com` is the **Production** domain (so `VERCEL_PROJECT_PRODUCTION_URL`, and hence `BETTER_AUTH_URL`, resolve to it).

### 4B. Realtime custom domain — intentionally skipped

Mapping `realtime.radheymugdal.com` → the Worker via a CNAME in Vercel DNS **will not work** (browser-side cert mismatch: Cloudflare issues certs for `*.workers.dev`, not for your zone, unless the whole `radheymugdal.com` zone is moved to Cloudflare — out of scope while the apex lives on Vercel). The free `*.workers.dev` URL is stable, HTTPS+helmet-safe, and fine for this game. If you later want the pretty subdomain, the migration order is: move `radheymugdal.com` zone to Cloudflare → attach `penfight` to Vercel via CNAME (Vercel supports non-A-NS hosting) → use a Workers **Custom Domain** route for `realtime`.

### 4C. Local-DNS check

`dig`/`nslookup penfight.radheymugdal.com` binds to the project after the domain attach; Workers URL requires no DNS.
If you use Cloudflare for anything, keep proxy "orange cloud" **off** for any CNAME you add — direct is simpler and avoids WS-through-proxy surprises.

## Phase 5 — Smoke test

```bash
# DB/auth: 
bun run db:studio  → confirm login, bonus pen etc. work against prod DB (Neon)
# Full stack check of the public subdomain:
curl -I https://penfight.radheymugdal.com                              → 200
curl -I https://penfight-realtime.<your-subdomain>.workers.dev         → 200/upgrade-capable response
# WSS: adjust and run the existing test harness
node test_3_clients.cjs        # edit URL to wss://penfight-realtime.<subdomain>.workers.dev/realtime/v1/websocket?apikey=test&vsn=1.0.0
# Logs: 
bunx wrangler tail                             (realtime), Vercel dashboard/CLI logs for web
```

Wait for TLS: first issuance on the Vercel domain takes ~1–30 min after DNS attach; browsers will say `ERR_SSL` until ready — unrelated to app health.

For the realtime DO, the room state lives in one DO; `wrangler deploy` restarts that singleton between deploys (rooms wiped — deploy between sessions, or accept mid-session room drops). Matches requiring restarts/failover later: phase the `real:room` maps into per-room `idFromName` DOs with SQLite persistence slot-in option. Hibernation means an *idle* DO is not running any code — no ongoing cost, vs Fly's always-on machine.

## Risks & future hardening

- **Bundle edit is fragile** — the WS URL lives in a prebuilt 3rd-party bundle (`groupMain-DWtBWKAW.js`). If that bundle is ever regenerated (asset match changes after a source game change), reapply the Phase 3 edit. Long-term, serve a tiny `realtime-config.js`/JSON with the URL so the bundle fetches it instead.
- **In-memory room state in the DO** — survives hibernation and socket chatter, but not DO redeploys/crash wrangler deploys. If matches must survive restarts later, add SQLite persistence inside the DO (`this.ctx.storage.sql`) for room state.
- **Single-DO serialization** — one DO processes messages serially; for a school game this is a feature (deterministic ordering), and hits limitations far beyond reasonable concurrent player counts. Sharding path documented in Phase 2.
- **Idle web traffic on Vercel Hobby** — the site is static-served SPA assets except API routes; keep an eye on the Hobby limits page after traffic appears.
- **WSS origin checks** — browsers don't enforce CORS on WS; add an `Origin` allowlist (or CF WAF rule on the upgrade request) to stop casual cross-site socket spam.
- **Scaling rooms** — over some concurrent scale, shard by room (`env.REALTIME.idFromName(topic)`) so each room is its own DO with per-room presence (changes the one-socket-multiple-topics behavior; only needed if you outgrow one DO).
