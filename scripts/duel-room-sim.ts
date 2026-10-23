// Two simulated players driving the real worker entry + DuelRoom DO.
// bun:sqlite stands in for Durable Object SQLite storage.
// Run from the repo root: bun scripts/duel-room-sim.ts
import { Database } from "bun:sqlite";
import worker, { DuelRoom } from "../packages/api/src/realtime-worker.ts";

let clock = Date.now();
Date.now = () => clock;

const instances = new Map<string, DuelRoom>();
const DUEL = {
	idFromName: (name: string) => ({ toString: () => name }),
	get: (id: { toString(): string }) => {
		const key = id.toString();
		let inst = instances.get(key);
		if (!inst) {
			const db = new Database(":memory:");
			const sql = {
				exec: (q: string, ...b: unknown[]) => {
					const stmt = db.query(q);
					const rows = stmt.all(...(b as never[]));
					return { toArray: () => rows };
				},
			};
			inst = new DuelRoom({ storage: { sql } } as never, {});
			instances.set(key, inst);
		}
		const target = inst;
		return { fetch: (r: Request) => target.fetch(r) };
	},
};
const env = { DUEL, REALTIME: DUEL } as never;

// Same unsigned token shape the bundle mints in uH().
function token(sub: string): string {
	const p = btoa(
		JSON.stringify({ iss: "x/auth/v1", sub, exp: 9e9, role: "authenticated" })
	).replace(/=/g, "");
	return `eyJhbGciOiJub25lIn0.${p}.sig`;
}

async function rpc(who: string, fn: string, body: Record<string, unknown>) {
	const res = await worker.fetch(
		new Request(`https://w.dev/rest/v1/rpc/${fn}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Origin: "https://penfight.radheymugdal.com",
				Authorization: `Bearer ${token(who)}`,
			},
			body: JSON.stringify(body),
		}),
		env
	);
	const text = await res.text();
	return { status: res.status, body: JSON.parse(text), cors: res.headers.get("Access-Control-Allow-Origin") };
}

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
	console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
	if (!cond) {
		failures++;
		console.log("      ->", JSON.stringify(extra));
	}
}

const HOST = "11111111-1111-4111-8111-111111111111";
const GUEST = "22222222-2222-4222-8222-222222222222";
const CODE = "abcdefghjkmnpqrstuvw";
const ROOM = `room_${CODE}`;

function pkg(shooter: string, bout: number, turn: number, base: number, cmd: string) {
	return {
		version: 1, commandId: cmd, bout, turn, baseRevision: base, shooterId: shooter,
		penOrder: [HOST, GUEST], shot: { strikeT: 0.1, dx: 0.5, dz: -0.5, power: 0.7 },
		tickHz: 120, sampleEveryTicks: 4, durationTicks: 8,
		frames: [[0, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7], [8, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7]],
		events: [], outs: [], final: {}, frameHash: "h",
	};
}
const cmd = (n: number) => `${String(n).padStart(8, "0")}-0000-4000-8000-000000000000`;

// --- seats
let r = await rpc(HOST, "duel_create_room_v2", { p_code: CODE, p_name: "radhey" });
check("host seated", r.body.role === "host" && r.body.user_id === HOST, r.body);
check("CORS header present", r.cors === "https://penfight.radheymugdal.com", r.cors);
r = await rpc(GUEST, "duel_join_room_v2", { p_code: CODE, p_name: "friend" });
check("guest seated", r.body.role === "guest" && r.body.peer_id === HOST, r.body);
r = await rpc("33333333-3333-4333-8333-333333333333", "duel_join_room_v2", { p_code: CODE, p_name: "x" });
check("third player refused", r.status === 409 && r.body.code === "room_full", r);
r = await rpc("33333333-3333-4333-8333-333333333333", "duel_ready_v3", { p_room: ROOM, p_bout: 0, p_pen: "cello", p_stake: null });
check("outsider cannot act (42501)", r.body.code === "42501", r);

// --- bout 0 terms
r = await rpc(HOST, "duel_bout_status_v2", { p_room: ROOM, p_bout: 0 });
check("unknown bout -> P0002", r.body.code === "P0002", r);
r = await rpc(HOST, "duel_ready_v3", { p_room: ROOM, p_bout: 0, p_pen: "cello_gripper", p_stake: "cello_gripper" });
check("host ready -> terms", r.body.status === "terms", r.body);
r = await rpc(GUEST, "duel_ready_v3", { p_room: ROOM, p_bout: 0, p_pen: "reynolds045", p_stake: "linc_x" });
check("stake must equal pen (22023)", r.body.code === "22023", r);
r = await rpc(HOST, "duel_commit_turn_v1", { p_room: ROOM, p_bout: 0, p_turn: 1, p_base_revision: 0, p_command: cmd(1), p_package: pkg(HOST, 0, 1, 0, cmd(1)) });
check("commit before bout live -> 55000 (client retries)", r.body.code === "55000", r);
r = await rpc(GUEST, "duel_ready_v3", { p_room: ROOM, p_bout: 0, p_pen: "reynolds045", p_stake: null });
check("guest ready -> playing", r.body.status === "playing", r.body);
check("pens frozen per role", r.body.host_pen === "cello_gripper" && r.body.guest_pen === "reynolds045", r.body);
r = await rpc(HOST, "duel_bout_status_v2", { p_room: ROOM, p_bout: 0 });
check("host sees playing too", r.body.status === "playing" && r.body.host_pen === "cello_gripper", r.body);

// --- turns
const p1 = pkg(HOST, 0, 1, 0, cmd(1));
r = await rpc(HOST, "duel_commit_turn_v1", { p_room: ROOM, p_bout: 0, p_turn: 1, p_base_revision: 0, p_command: cmd(1), p_package: p1 });
check("host turn 1 committed rev 1", r.body.status === "committed" && r.body.revision === 1, r.body);
r = await rpc(GUEST, "duel_turns_since_v1", { p_room: ROOM, p_bout: 0, p_after_revision: 0 });
check("guest downloads host's shot", Array.isArray(r.body) && r.body.length === 1 && JSON.stringify(r.body[0].package) === JSON.stringify(p1), r.body);
// The client's own receipt check (Bx): package.baseRevision + 1 === revision etc.
const rc = r.body[0];
check("receipt passes client validation", rc.package.commandId === rc.command_id && rc.package.turn === rc.turn && rc.package.baseRevision + 1 === rc.revision, rc);
r = await rpc(HOST, "duel_commit_turn_v1", { p_room: ROOM, p_bout: 0, p_turn: 1, p_base_revision: 0, p_command: cmd(1), p_package: p1 });
check("retried commit -> duplicate", r.body.status === "duplicate" && r.body.revision === 1, r.body);
r = await rpc(GUEST, "duel_commit_turn_v1", { p_room: ROOM, p_bout: 0, p_turn: 2, p_base_revision: 0, p_command: cmd(2), p_package: pkg(GUEST, 0, 2, 0, cmd(2)) });
check("stale base revision rejected (P0001)", r.body.code === "P0001", r);
r = await rpc(GUEST, "duel_commit_turn_v1", { p_room: ROOM, p_bout: 0, p_turn: 2, p_base_revision: 1, p_command: cmd(3), p_package: pkg(HOST, 0, 2, 1, cmd(3)) });
check("cannot commit a shot as the other player", r.body.code === "invalid", r);
r = await rpc(GUEST, "duel_commit_turn_v1", { p_room: ROOM, p_bout: 0, p_turn: 2, p_base_revision: 1, p_command: cmd(4), p_package: pkg(GUEST, 0, 2, 1, cmd(4)) });
check("guest turn 2 committed rev 2", r.body.status === "committed" && r.body.revision === 2, r.body);
r = await rpc(HOST, "duel_turns_since_v1", { p_room: ROOM, p_bout: 0, p_after_revision: 1 });
check("host downloads guest's shot", r.body.length === 1 && r.body[0].revision === 2 && r.body[0].package.shooterId === GUEST, r.body);
r = await rpc(HOST, "duel_turns_since_v1", { p_room: ROOM, p_bout: 0, p_after_revision: 0 });
check("reconnecting player can replay full history", r.body.length === 2, r.body);

// --- touch + abandon
r = await rpc(HOST, "duel_touch_v3", { p_room: ROOM, p_bout: 0 });
check("touch ok", r.body.status === "playing", r.body);
r = await rpc(HOST, "duel_claim_abandon_v3", { p_room: ROOM, p_bout: 0 });
check("early abandon claim refused with wait time", r.body.status === "playing" && r.body.claim_after_ms > 0, r.body);

// --- report: agreeing reports settle, stake moves
r = await rpc(HOST, "duel_report_v2", { p_room: ROOM, p_bout: 0, p_winner: GUEST, p_host_score: 1, p_guest_score: 3 });
check("first report -> reporting", r.body.status === "reporting", r.body);
r = await rpc(GUEST, "duel_report_v2", { p_room: ROOM, p_bout: 0, p_winner: GUEST, p_host_score: 1, p_guest_score: 3 });
check("matching report -> settled for guest", r.body.status === "settled" && r.body.winner_id === GUEST && r.body.result_reason === "played", r.body);
check("host's staked pen moves to guest", r.body.moved_pen === "cello_gripper" && r.body.moved_to_me === true, r.body);
r = await rpc(HOST, "duel_bout_status_v2", { p_room: ROOM, p_bout: 0 });
check("host sees same result, pen not to them", r.body.winner_id === GUEST && r.body.moved_to_me === false, r.body);
r = await rpc(HOST, "duel_commit_turn_v1", { p_room: ROOM, p_bout: 0, p_turn: 3, p_base_revision: 2, p_command: cmd(5), p_package: pkg(HOST, 0, 3, 2, cmd(5)) });
check("no turns after settlement", r.body.code === "P0001", r);

// --- bout 1 (rematch): concede
await rpc(HOST, "duel_ready_v3", { p_room: ROOM, p_bout: 1, p_pen: "cello_gripper", p_stake: null });
r = await rpc(GUEST, "duel_ready_v3", { p_room: ROOM, p_bout: 1, p_pen: "reynolds045", p_stake: null });
check("rematch bout 1 playing", r.body.status === "playing", r.body);
r = await rpc(GUEST, "duel_turns_since_v1", { p_room: ROOM, p_bout: 1, p_after_revision: 0 });
check("new bout has a clean turn log", r.body.length === 0, r.body);
r = await rpc(GUEST, "duel_concede_v3", { p_room: ROOM, p_bout: 1 });
check("concede -> host wins, guest forfeited", r.body.status === "settled" && r.body.winner_id === HOST && r.body.result_reason === "conceded" && r.body.forfeited_user_id === GUEST, r.body);

// --- bout 2: abandon after silence
await rpc(HOST, "duel_ready_v3", { p_room: ROOM, p_bout: 2, p_pen: "cello_gripper", p_stake: null });
await rpc(GUEST, "duel_ready_v3", { p_room: ROOM, p_bout: 2, p_pen: "reynolds045", p_stake: null });
clock += 30_000;
await rpc(HOST, "duel_touch_v3", { p_room: ROOM, p_bout: 2 });
clock += 20_000;
r = await rpc(HOST, "duel_claim_abandon_v3", { p_room: ROOM, p_bout: 2 });
check("silent guest can be claimed as abandoned", r.body.status === "settled" && r.body.result_reason === "abandoned" && r.body.winner_id === HOST, r.body);

// --- bout 3: disagreeing reports void; finish during terms closes desk
await rpc(HOST, "duel_ready_v3", { p_room: ROOM, p_bout: 3, p_pen: "cello_gripper", p_stake: null });
await rpc(GUEST, "duel_ready_v3", { p_room: ROOM, p_bout: 3, p_pen: "reynolds045", p_stake: null });
await rpc(HOST, "duel_report_v2", { p_room: ROOM, p_bout: 3, p_winner: HOST });
r = await rpc(GUEST, "duel_report_v2", { p_room: ROOM, p_bout: 3, p_winner: GUEST });
check("conflicting reports -> void", r.body.status === "void", r.body);
await rpc(HOST, "duel_ready_v3", { p_room: ROOM, p_bout: 4, p_pen: "cello_gripper", p_stake: null });
r = await rpc(HOST, "duel_finish_v1", { p_room: ROOM, p_bout: 4 });
check("leaving during terms -> finished", r.body.status === "finished", r.body);
r = await rpc(GUEST, "duel_bout_status_v2", { p_room: ROOM, p_bout: 4 });
check("friend sees that bout called off", r.body.status === "void", r.body);

// --- single report settles after a while
await rpc(HOST, "duel_ready_v3", { p_room: ROOM, p_bout: 5, p_pen: "cello_gripper", p_stake: null });
await rpc(GUEST, "duel_ready_v3", { p_room: ROOM, p_bout: 5, p_pen: "reynolds045", p_stake: null });
r = await rpc(GUEST, "duel_finish_v1", { p_room: ROOM, p_bout: 5 });
check("finish during a live bout -> keep playing", r.body.status === "playing", r.body);
await rpc(HOST, "duel_report_v2", { p_room: ROOM, p_bout: 5, p_winner: HOST });
clock += 121_000;
r = await rpc(GUEST, "duel_bout_status_v2", { p_room: ROOM, p_bout: 5 });
check("lone report settles after 2 min", r.body.status === "settled" && r.body.winner_id === HOST, r.body);

// --- functions left client-side still 404 on the worker
r = await rpc(HOST, "duel_my_rivalries_v2", { p_limit: 5 });
check("unrelated functions still 404", r.status === 404, r);

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
