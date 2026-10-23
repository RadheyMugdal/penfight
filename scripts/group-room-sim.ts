// Three simulated players driving the real worker + DuelRoom/GroupDesk.
// Run from the repo root: bun scripts/group-room-sim.ts
import { Database } from "bun:sqlite";
import worker, { DuelRoom } from "../packages/api/src/realtime-worker.ts";
let clock = Date.now(); Date.now = () => clock;
const inst = new Map<string, DuelRoom>();
const DUEL = { idFromName: (n: string) => ({ toString: () => n }), get: (id: { toString(): string }) => { const k = id.toString(); let i = inst.get(k); if (!i) { const db = new Database(":memory:"); i = new DuelRoom({ storage: { sql: { exec: (q: string, ...b: unknown[]) => { const rows = db.query(q).all(...(b as never[])); return { toArray: () => rows }; } } } } as never, {}); inst.set(k, i); } const t = i; return { fetch: (r: Request) => t.fetch(r) }; } };
const env = { DUEL, REALTIME: DUEL } as never;
const tok = (sub: string) => `eyJhbGciOiJub25lIn0.${btoa(JSON.stringify({ sub })).replace(/=/g, "")}.sig`;
async function rpc(who: string, fn: string, body: Record<string, unknown>) { const r = await worker.fetch(new Request(`https://w/rest/v1/rpc/${fn}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://penfight.radheymugdal.com", Authorization: `Bearer ${tok(who)}` }, body: JSON.stringify(body) }), env); return { status: r.status, body: JSON.parse(await r.text()) }; }
let fails = 0; const check = (n: string, c: boolean, x?: unknown) => { console.log(`${c ? "PASS" : "FAIL"}  ${n}`); if (!c) { fails++; console.log("   ->", JSON.stringify(x)); } };
const [A, B, C, D] = ["aaaaaaaa-0000-4000-8000-000000000001", "bbbbbbbb-0000-4000-8000-000000000002", "cccccccc-0000-4000-8000-000000000003", "dddddddd-0000-4000-8000-000000000004"];
const CODE = "k7mx2p"; const ROOM = `group_${CODE}`;
const cmd = (n: number) => `${String(n).padStart(8, "0")}-0000-4000-8000-000000000000`;

let r = await rpc(A, "group_create_room_v2", { p_code: CODE, p_name: "radhey", p_pen: "cello_gripper", p_size: 3 });
check("host seated at seat 0, waiting", r.body.my_seat === 0 && r.body.status === "waiting" && r.body.room_id === ROOM, r.body);
r = await rpc(B, "group_join_room_v2", { p_code: CODE, p_name: "aman", p_pen: "reynolds045" });
check("2nd player seat 1, still waiting", r.body.my_seat === 1 && r.body.status === "waiting" && r.body.members.length === 2, r.body);
r = await rpc(C, "group_join_room_v2", { p_code: CODE, p_name: "priya", p_pen: "reynolds045" });
check("3rd player seat 2 sees all three", r.body.my_seat === 2 && r.body.members.length === 3 && r.body.status === "terms", r.body);
r = await rpc(A, "group_status_v1", { p_room: ROOM });
check("1st player also sees all three", r.body.members.map((m: any) => m.name).join() === "radhey,aman,priya", r.body.members);
r = await rpc(B, "group_status_v1", { p_room: ROOM });
check("2nd player also sees all three", r.body.members.length === 3 && r.body.status === "terms", r.body);
r = await rpc(D, "group_join_room_v2", { p_code: CODE, p_name: "extra" });
check("4th player refused", r.status === 409, r);
r = await rpc(C, "group_join_room_v2", { p_code: CODE, p_name: "priya" });
check("reload keeps the same seat", r.body.my_seat === 2 && r.body.members.length === 3, r.body);

// ready
await rpc(A, "group_ready_v2", { p_room: ROOM, p_match_no: 1, p_pen: "cello_gripper" });
r = await rpc(B, "group_ready_v2", { p_room: ROOM, p_match_no: 1, p_pen: "reynolds045" });
check("2 of 3 ready -> still terms", r.body.status === "terms" && r.body.members.filter((m: any) => m.ready).length === 2, r.body);
r = await rpc(C, "group_ready_v2", { p_room: ROOM, p_match_no: 1, p_pen: "linc_pentonic" });
check("all ready -> playing with a fresh state", r.body.status === "playing" && r.body.state?.revision === 0 && r.body.state.activeSeat === 0 && r.body.state.scores.length === 3, r.body);
const st0 = r.body.state;
check("pens recorded per seat", r.body.members[2].pen === "linc_pentonic", r.body.members);

// turn by seat 0
const pkg = (seat: number, turn: number, base: number, c: string) => ({ version: 1, commandId: c, bout: 1, turn, baseRevision: base, shooterId: `seat-${seat}`, penOrder: ["seat-0", "seat-1", "seat-2"], final: { "seat-0": { p: [0, 0, 0], q: [0, 0, 0, 1] } } });
const st2 = { ...st0, revision: 2, turn: 2, activeSeat: 1 };
r = await rpc(B, "group_commit_turn_v2", { p_room: ROOM, p_match_no: 1, p_base_revision: 0, p_command: cmd(1), p_turn: 1, p_package: pkg(1, 1, 0, cmd(1)), p_state: st2 });
check("not your turn -> rejected", r.body.code === "P0001" || r.body.code === "invalid", r);
r = await rpc(A, "group_commit_turn_v2", { p_room: ROOM, p_match_no: 1, p_base_revision: 0, p_command: cmd(2), p_turn: 1, p_package: pkg(0, 1, 0, cmd(2)), p_state: st2 });
check("seat 0 shot committed at revision 2", r.body.status === "committed" && r.body.revision === 2 && r.body.state.activeSeat === 1, r.body);
for (const [who, name] of [[B, "2nd"], [C, "3rd"]] as const) {
  const t = await rpc(who, "group_turns_since_v2", { p_room: ROOM, p_match_no: 1, p_after_revision: 0 });
  check(`${name} player downloads the shot`, t.body.length === 1 && t.body[0].package.shooterId === "seat-0" && t.body[0].state.revision === 2, t.body);
}
r = await rpc(A, "group_commit_turn_v2", { p_room: ROOM, p_match_no: 1, p_base_revision: 0, p_command: cmd(2), p_turn: 1, p_package: pkg(0, 1, 0, cmd(2)), p_state: st2 });
check("retry -> duplicate", r.body.status === "duplicate", r.body);
const st4 = { ...st0, revision: 4, turn: 3, activeSeat: 2 };
r = await rpc(B, "group_commit_turn_v2", { p_room: ROOM, p_match_no: 1, p_base_revision: 0, p_command: cmd(3), p_turn: 2, p_package: pkg(1, 2, 0, cmd(3)), p_state: { ...st4, revision: 2 } });
check("stale base -> 40001 (client refreshes)", r.body.code === "40001", r);
r = await rpc(B, "group_commit_turn_v2", { p_room: ROOM, p_match_no: 1, p_base_revision: 2, p_command: cmd(4), p_turn: 2, p_package: pkg(1, 2, 2, cmd(4)), p_state: st4 });
check("seat 1 shot committed at revision 4", r.body.revision === 4, r.body);
r = await rpc(C, "group_status_v1", { p_room: ROOM });
check("status carries latest state + pens", r.body.state.revision === 4 && r.body.pens !== null && r.body.transition_owner_user_id === B, r.body);

// round result -> next round frame by last shooter
const st6 = { ...st0, revision: 6, turn: 3, activeSeat: null, phase: "round_result", outs: [0, 1], roundWinners: [2], scores: [0, 0, 1] };
r = await rpc(C, "group_commit_turn_v2", { p_room: ROOM, p_match_no: 1, p_base_revision: 4, p_command: cmd(5), p_turn: 3, p_package: pkg(2, 3, 4, cmd(5)), p_state: st6 });
check("round-winning shot committed", r.body.revision === 6, r.body);
const st7 = { ...st6, revision: 7, turn: 4, round: 2, opener: 1, activeSeat: 1, phase: "aiming", outs: [], layoutRotation: 1 };
r = await rpc(C, "group_commit_frame_v1", { p_room: ROOM, p_match_no: 1, p_expected_revision: 6, p_state: st7, p_pens: { a: 1 } });
check("next-round frame saved", r.body.state.revision === 7 && r.body.state.round === 2, r.body.state);
r = await rpc(A, "group_commit_frame_v1", { p_room: ROOM, p_match_no: 1, p_expected_revision: 6, p_state: st7, p_pens: { a: 1 } });
check("same frame again is harmless", r.status === 200 && r.body.state.revision === 7, r);

// a player leaves mid match
r = await rpc(C, "group_leave_v1", { p_room: ROOM });
r = await rpc(A, "group_status_v1", { p_room: ROOM });
check("leaver withdrawn, match continues with 2", r.body.status === "playing" && r.body.members.find((m: any) => m.user_id === C).present === false && r.body.state.withdrawn.includes(2) && r.body.state.revision === 8, r.body);

// idle player: with 2 left, the other player's report is unanimous
r = await rpc(A, "group_report_absent_v1", { p_room: ROOM, p_match_no: 1, p_target: B });
check("idle player dropped -> desk closes (1 left)", r.body.status === "closed", r.body);

// with 3 present, one report on a recently-seen player is only a vote
const V = "vv7vv7";
for (const [w, n] of [[A, "a"], [B, "b"], [C, "c"]] as const) await rpc(w, n === "a" ? "group_create_room_v2" : "group_join_room_v2", { p_code: V, p_name: n, p_size: 3 });
for (const w of [A, B, C]) await rpc(w, "group_ready_v2", { p_room: `group_${V}`, p_match_no: 1, p_pen: "reynolds045" });
r = await rpc(A, "group_report_absent_v1", { p_room: `group_${V}`, p_match_no: 1, p_target: B });
check("one report of three = just a vote", r.body.members[1].present === true && r.body.drop_votes.length === 1, r.body);
r = await rpc(C, "group_report_absent_v1", { p_room: `group_${V}`, p_match_no: 1, p_target: B });
check("both others report -> dropped, turn moves on", r.body.members[1].present === false && r.body.state.withdrawn.includes(1) && r.body.status === "playing", r.body);
await rpc(A, "group_status_v1", { p_room: `group_${V}` });
clock += 50_000;
await rpc(A, "group_status_v1", { p_room: `group_${V}` });
r = await rpc(A, "group_report_absent_v1", { p_room: `group_${V}`, p_match_no: 1, p_target: C });
check("player silent 45s+ dropped on one report", r.body.status === "closed", r.body);

// lobby leave frees seat
await rpc(A, "group_create_room_v2", { p_code: "zz9zz9", p_name: "radhey", p_size: 3 });
await rpc(B, "group_join_room_v2", { p_code: "zz9zz9", p_name: "aman" });
await rpc(B, "group_leave_v1", { p_room: "group_zz9zz9" });
r = await rpc(C, "group_join_room_v2", { p_code: "zz9zz9", p_name: "priya" });
check("seat freed in lobby is reused", r.body.my_seat === 1 && r.body.members.length === 2, r.body);
r = await rpc(D, "group_join_room_v2", { p_code: "nope42", p_name: "x" });
check("joining a desk that does not exist -> clear error", r.status === 404 && r.body.code === "P0002", r);

// rematch
const R2 = "re3re3";
for (const [w, n] of [[A, "a"], [B, "b"], [C, "c"]] as const) await rpc(w, n === "a" ? "group_create_room_v2" : "group_join_room_v2", { p_code: R2, p_name: n, p_size: 3 });
for (const w of [A, B, C]) r = await rpc(w, "group_ready_v2", { p_room: `group_${R2}`, p_match_no: 1, p_pen: "reynolds045" });
const s0 = r.body.state;
const endState = { ...s0, revision: 2, turn: 2, activeSeat: null, phase: "match_end", winner: 0, scores: [3, 0, 0] };
r = await rpc(A, "group_commit_turn_v2", { p_room: `group_${R2}`, p_match_no: 1, p_base_revision: 0, p_command: cmd(9), p_turn: 1, p_package: { ...pkg(0, 1, 0, cmd(9)), bout: 1 }, p_state: endState });
r = await rpc(B, "group_status_v1", { p_room: `group_${R2}` });
check("match_end -> ended", r.body.status === "ended", r.body.status);
await rpc(A, "group_ready_v2", { p_room: `group_${R2}`, p_match_no: 1, p_pen: "reynolds045" });
r = await rpc(B, "group_ready_v2", { p_room: `group_${R2}`, p_match_no: 1, p_pen: "reynolds045" });
check("rematch waits for everyone", r.body.status === "ended" && r.body.match_no === 1, r.body);
r = await rpc(C, "group_ready_v2", { p_room: `group_${R2}`, p_match_no: 1, p_pen: "reynolds045" });
check("rematch starts match 2 with new state, next opener", r.body.status === "playing" && r.body.match_no === 2 && r.body.state.revision === 0 && r.body.state.matchId !== s0.matchId && r.body.state.opener === 1, r.body);
r = await rpc(A, "group_turns_since_v2", { p_room: `group_${R2}`, p_match_no: 2, p_after_revision: 0 });
check("match 2 turn log is clean", r.body.length === 0, r.body);

// duel still works alongside
r = await rpc(A, "duel_create_room_v2", { p_code: CODE, p_name: "radhey" });
check("a duel with the same code is a separate room", r.body.role === "host", r.body);
console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED"); process.exit(fails ? 1 : 0);
