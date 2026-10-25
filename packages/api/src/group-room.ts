// Authoritative state for 3-player "group desk" rooms.
//
// Lives inside the same per-room Durable Object class as duels (DuelRoom), on
// its own tables, addressed as `idFromName("group:" + code)`. The game bundle
// previously faked every group call in the browser and stitched the roster
// together from presence broadcasts, a BroadcastChannel and localStorage, so
// the third player and the first two each saw a different desk. Here the
// server owns:
//   - seats (lowest free seat, stable across reloads for the same player id)
//   - the lobby -> terms -> playing -> ended lifecycle and rematches
//   - the match state snapshot and its revision counter
//   - the ordered turn log that every browser replays from
//   - who left / was dropped, folded into the match state as "withdrawn"
//
// The game is shooter-authoritative: the shooter simulates the shot, then
// commits the trajectory package together with the resulting state. The server
// checks it is that player's turn and that it builds on the latest revision.

const MAX_NAME_LENGTH = 12;
const MAX_PACKAGE_BYTES = 64 * 1024;
const MAX_STATE_BYTES = 16 * 1024;
const MAX_TURNS_RETURNED = 500;
const DEFAULT_SIZE = 3;
const MIN_SIZE = 2;
const MAX_SIZE = 6;
// A member silent this long can be dropped by a single report.
const SILENT_DROP_MS = 45_000;
const PEN_ID_PATTERN = /^[a-z0-9_-]{1,48}$/;
const COMMAND_ID_PATTERN = /^[0-9a-f-]{36}$/i;

type GroupStatus = "waiting" | "terms" | "playing" | "ended" | "closed";

interface SqlCursor<T> {
	toArray(): T[];
}

export interface SqlStorageLike {
	exec<T = Record<string, unknown>>(
		query: string,
		...bindings: unknown[]
	): SqlCursor<T>;
}

export class GroupError extends Error {
	readonly code: string;
	readonly httpStatus: number;

	constructor(message: string, code: string, httpStatus: number) {
		super(message);
		this.code = code;
		this.httpStatus = httpStatus;
	}
}

interface GroupRoomRow {
	code: string;
	match_no: number;
	pens: string | null;
	roster_revision: number;
	size: number;
	state: string | null;
	state_revision: number;
	status: string;
	transition_owner: string | null;
	updated_at: number;
}

interface GroupMemberRow {
	last_seen: number;
	name: string;
	pen: string;
	present: number;
	ready_match: number;
	seat: number;
	user_id: string;
}

interface GroupTurnRow {
	command_id: string;
	package: string;
	revision: number;
	state: string;
	turn: number;
}

interface GroupVoteRow {
	reporter: string;
	target: string;
}

// The match state shape the bundle's group engine (class `tn`) understands.
interface GroupMatchState {
	activeSeat: number | null;
	layoutRotation: number;
	matchId: string;
	opener: number;
	outs: number[];
	phase: string;
	revision: number;
	round: number;
	roundWinners: (number | null)[];
	scores: number[];
	turn: number;
	winner: number | null;
	withdrawn: number[];
	[key: string]: unknown;
}

export interface GroupRoomAnswer {
	code: string;
	drop_votes: { reporter_user_id: string; target_user_id: string }[];
	match_no: number;
	members: {
		user_id: string;
		name: string;
		pen: string;
		present: boolean;
		ready: boolean;
		seat: number;
	}[];
	my_seat: number;
	pens: unknown;
	room_id: string;
	roster_revision: number;
	size: number;
	state: GroupMatchState | null;
	status: GroupStatus;
	topic: string;
	transition_owner_user_id: string | null;
	user_id: string;
}

const invalid = (message: string) => new GroupError(message, "invalid", 400);
const stale = () =>
	new GroupError("the desk moved on; catch up first", "40001", 409);

function normaliseName(raw: unknown): string {
	if (typeof raw !== "string") {
		return "friend";
	}
	const name = raw
		.trim()
		.replace(/\s+/g, " ")
		.replace(/[^\w ._-]/g, "")
		.slice(0, MAX_NAME_LENGTH);
	return name || "friend";
}

function normalisePen(raw: unknown): string {
	return typeof raw === "string" && PEN_ID_PATTERN.test(raw)
		? raw
		: "reynolds045";
}

function readSize(raw: unknown): number {
	return typeof raw === "number" &&
		Number.isInteger(raw) &&
		raw >= MIN_SIZE &&
		raw <= MAX_SIZE
		? raw
		: DEFAULT_SIZE;
}

function readInt(raw: unknown, what: string): number {
	if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 0) {
		throw invalid(`invalid ${what}`);
	}
	return raw;
}

function toStatus(raw: string): GroupStatus {
	if (
		raw === "terms" ||
		raw === "playing" ||
		raw === "ended" ||
		raw === "closed"
	) {
		return raw;
	}
	return "waiting";
}

function parseJson<T>(raw: string | null): T | null {
	if (!raw) {
		return null;
	}
	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

function isMatchState(value: unknown): value is GroupMatchState {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}
	const s = value as Record<string, unknown>;
	return (
		typeof s.matchId === "string" &&
		Number.isInteger(s.revision) &&
		Number.isInteger(s.turn) &&
		typeof s.phase === "string" &&
		Array.isArray(s.outs) &&
		Array.isArray(s.scores) &&
		Array.isArray(s.roundWinners)
	);
}

function jsonBytes(value: unknown): number {
	return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

function seatId(seat: number): string {
	return `seat-${seat}`;
}

// Same rotation the bundle's engine uses (`en`): the next seat after `from`
// that is not in `skip`.
function nextSeat(
	from: number,
	skip: Set<number>,
	size: number
): number | null {
	for (let step = 1; step <= size; step++) {
		const seat = (((from + step) % size) + size) % size;
		if (!skip.has(seat)) {
			return seat;
		}
	}
	return null;
}

export class GroupDesk {
	private readonly sql: SqlStorageLike;

	constructor(sql: SqlStorageLike) {
		this.sql = sql;
		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS group_room (
				code TEXT PRIMARY KEY,
				size INTEGER NOT NULL,
				status TEXT NOT NULL DEFAULT 'waiting',
				match_no INTEGER NOT NULL DEFAULT 1,
				roster_revision INTEGER NOT NULL DEFAULT 0,
				state TEXT,
				pens TEXT,
				state_revision INTEGER NOT NULL DEFAULT 0,
				transition_owner TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);
		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS group_member (
				user_id TEXT PRIMARY KEY,
				seat INTEGER NOT NULL UNIQUE,
				name TEXT NOT NULL,
				pen TEXT NOT NULL,
				ready_match INTEGER NOT NULL DEFAULT 0,
				present INTEGER NOT NULL DEFAULT 1,
				last_seen INTEGER NOT NULL
			)
		`);
		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS group_turn (
				match_no INTEGER NOT NULL,
				revision INTEGER NOT NULL,
				turn INTEGER NOT NULL,
				command_id TEXT NOT NULL,
				shooter_id TEXT NOT NULL,
				package TEXT NOT NULL,
				state TEXT NOT NULL,
				created_at INTEGER NOT NULL,
				PRIMARY KEY (match_no, revision),
				UNIQUE (match_no, command_id)
			)
		`);
		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS group_vote (
				match_no INTEGER NOT NULL,
				reporter TEXT NOT NULL,
				target TEXT NOT NULL,
				PRIMARY KEY (match_no, reporter, target)
			)
		`);
	}

	dispatch(
		fn: string,
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): unknown {
		switch (fn) {
			case "group_create_room_v2":
				return this.sit(code, callerId, body, true);
			case "group_join_room_v2":
				return this.sit(code, callerId, body, false);
			case "group_status_v1":
				return this.status(code, callerId);
			case "group_present_v1":
				return this.present(code, callerId);
			case "group_ready_v2":
				return this.ready(code, callerId, body);
			case "group_commit_turn_v2":
				return this.commitTurn(code, callerId, body);
			case "group_turns_since_v2":
				return this.turnsSince(code, callerId, body);
			case "group_commit_frame_v1":
				return this.commitFrame(code, callerId, body);
			case "group_leave_v1":
				return this.leave(code, callerId);
			case "group_report_absent_v1":
				return this.reportAbsent(code, callerId, body);
			default:
				throw new GroupError(`unsupported function ${fn}`, "invalid", 404);
		}
	}

	// ---- seats ---------------------------------------------------------------

	private sit(
		code: string,
		callerId: string,
		body: Record<string, unknown>,
		creating: boolean
	): GroupRoomAnswer {
		const now = Date.now();
		const name = normaliseName(body.p_name);
		const pen = normalisePen(body.p_pen);
		let room = this.readRoom(code);
		if (!room) {
			if (!creating) {
				throw new GroupError(
					"that desk is not open any more. ask for a new link.",
					"P0002",
					404
				);
			}
			this.sql.exec(
				`INSERT INTO group_room (code, size, status, match_no, created_at, updated_at)
				 VALUES (?, ?, 'waiting', 1, ?, ?)`,
				code,
				readSize(body.p_size),
				now,
				now
			);
			room = this.mustReadRoom(code);
		}

		const existing = this.readMember(callerId);
		if (existing) {
			// Same player id coming back (reload, second tab, rematch link).
			const live = toStatus(room.status) === "playing";
			const withdrawn = this.currentState(room)?.withdrawn ?? [];
			const present =
				live && withdrawn.includes(existing.seat) ? existing.present : 1;
			this.sql.exec(
				"UPDATE group_member SET name = ?, pen = ?, present = ?, last_seen = ? WHERE user_id = ?",
				name,
				live ? existing.pen : pen,
				present,
				now,
				callerId
			);
			this.bumpRoster(code);
			return this.answer(code, callerId);
		}

		const status = toStatus(room.status);
		if (status !== "waiting" && status !== "terms") {
			throw new GroupError(
				"this desk already started. ask for a new link.",
				"room_full",
				409
			);
		}
		const taken = new Set(this.members().map((m) => m.seat));
		let seat = -1;
		for (let slot = 0; slot < room.size; slot++) {
			if (!taken.has(slot)) {
				seat = slot;
				break;
			}
		}
		if (seat < 0) {
			throw new GroupError(
				"this desk is full. ask for a new link.",
				"room_full",
				409
			);
		}
		this.sql.exec(
			`INSERT INTO group_member (user_id, seat, name, pen, ready_match, present, last_seen)
			 VALUES (?, ?, ?, ?, 0, 1, ?)`,
			callerId,
			seat,
			name,
			pen,
			now
		);
		this.refreshLobbyStatus(code);
		this.bumpRoster(code);
		return this.answer(code, callerId);
	}

	private status(code: string, callerId: string): GroupRoomAnswer {
		this.requireMember(code, callerId);
		this.touch(callerId);
		return this.answer(code, callerId);
	}

	private present(code: string, callerId: string): GroupRoomAnswer {
		const member = this.requireMember(code, callerId);
		const room = this.mustReadRoom(code);
		// A player who reloads mid-match is back; one who already withdrew from
		// the running match stays out of it until the next one.
		const withdrawn = this.currentState(room)?.withdrawn ?? [];
		const canReturn =
			toStatus(room.status) !== "playing" || !withdrawn.includes(member.seat);
		this.sql.exec(
			"UPDATE group_member SET last_seen = ?, present = ? WHERE user_id = ?",
			Date.now(),
			canReturn ? 1 : member.present,
			callerId
		);
		if (canReturn && member.present === 0) {
			this.bumpRoster(code);
		}
		return this.answer(code, callerId);
	}

	// ---- lifecycle -----------------------------------------------------------

	private ready(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): GroupRoomAnswer {
		this.requireMember(code, callerId);
		const matchNo = readInt(body.p_match_no, "match");
		const room = this.mustReadRoom(code);
		const status = toStatus(room.status);
		this.touch(callerId);

		if (matchNo !== room.match_no) {
			return this.answer(code, callerId);
		}
		if (status !== "terms" && status !== "ended") {
			return this.answer(code, callerId);
		}

		// After a match ends, "ready" means "ready for the next one".
		const readyFor = readyTarget(room);
		this.sql.exec(
			"UPDATE group_member SET ready_match = ?, pen = ?, present = 1 WHERE user_id = ?",
			readyFor,
			normalisePen(body.p_pen),
			callerId
		);
		this.bumpRoster(code);

		const members = this.members();
		const everyoneReady =
			members.length === room.size &&
			members.every((m) => m.present === 1 && m.ready_match === readyFor);
		if (everyoneReady) {
			this.startMatch(room, status === "ended");
		}
		return this.answer(code, callerId);
	}

	private startMatch(room: GroupRoomRow, rematch: boolean): void {
		const matchNo = rematch ? room.match_no + 1 : room.match_no;
		const opener = (matchNo - 1) % room.size;
		const state: GroupMatchState = {
			activeSeat: opener,
			layoutRotation: 0,
			matchId: crypto.randomUUID(),
			opener,
			outs: [],
			phase: "aiming",
			revision: 0,
			round: 1,
			roundWinners: [],
			scores: Array.from({ length: room.size }, () => 0),
			turn: 1,
			winner: null,
			withdrawn: [],
		};
		this.sql.exec(
			`UPDATE group_room SET status = 'playing', match_no = ?, state = ?, pens = NULL,
			 state_revision = 0, transition_owner = NULL, updated_at = ? WHERE code = ?`,
			matchNo,
			JSON.stringify(state),
			Date.now(),
			room.code
		);
		this.sql.exec("DELETE FROM group_vote WHERE match_no < ?", matchNo);
	}

	// ---- turns & frames ------------------------------------------------------

	private commitTurn(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): Record<string, unknown> {
		const member = this.requireMember(code, callerId);
		const matchNo = readInt(body.p_match_no, "match");
		const baseRevision = readInt(body.p_base_revision, "revision");
		const turn = readInt(body.p_turn, "turn");
		const commandId = body.p_command;
		const pkg = body.p_package;
		const nextState = body.p_state;
		if (
			typeof commandId !== "string" ||
			!COMMAND_ID_PATTERN.test(commandId) ||
			!pkg ||
			typeof pkg !== "object" ||
			Array.isArray(pkg) ||
			!isMatchState(nextState)
		) {
			throw invalid("invalid group turn");
		}
		const p = pkg as Record<string, unknown>;
		if (
			p.commandId !== commandId ||
			p.shooterId !== seatId(member.seat) ||
			p.bout !== matchNo ||
			p.turn !== turn ||
			p.baseRevision !== baseRevision ||
			nextState.revision !== baseRevision + 2
		) {
			throw invalid("group turn package does not match its command");
		}
		if (
			jsonBytes(pkg) > MAX_PACKAGE_BYTES ||
			jsonBytes(nextState) > MAX_STATE_BYTES
		) {
			throw invalid("group turn too large");
		}

		const duplicate = this.sql
			.exec<GroupTurnRow>(
				`SELECT revision, turn, command_id, package, state FROM group_turn
				 WHERE match_no = ? AND command_id = ?`,
				matchNo,
				commandId
			)
			.toArray()[0];
		if (duplicate) {
			return toTurnReceipt(duplicate, "duplicate");
		}

		const room = this.mustReadRoom(code);
		if (toStatus(room.status) !== "playing" || room.match_no !== matchNo) {
			throw new GroupError("this match is not running", "P0001", 409);
		}
		const current = this.currentState(room);
		if (!current || current.matchId !== nextState.matchId) {
			throw new GroupError("this match is not running", "P0001", 409);
		}
		if (baseRevision !== room.state_revision) {
			throw stale();
		}
		if (
			current.phase !== "aiming" ||
			current.activeSeat !== member.seat ||
			current.turn !== turn
		) {
			throw new GroupError("it is not your turn", "P0001", 409);
		}

		if (
			nextState.phase === "aiming" &&
			nextState.activeSeat !== null &&
			nextState.outs.includes(nextState.activeSeat)
		) {
			const skip = new Set([...nextState.outs, ...(nextState.withdrawn ?? [])]);
			const fixedSeat = nextSeat(nextState.activeSeat, skip, room.size);
			if (fixedSeat !== null) {
				nextState.activeSeat = fixedSeat;
			}
		}

		const packageJson = JSON.stringify(pkg);
		const stateJson = JSON.stringify(nextState);
		const finalPens = p.final && typeof p.final === "object" ? p.final : null;
		const now = Date.now();
		this.sql.exec(
			`INSERT INTO group_turn (match_no, revision, turn, command_id, shooter_id, package, state, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			matchNo,
			nextState.revision,
			turn,
			commandId,
			callerId,
			packageJson,
			stateJson,
			now
		);
		this.sql.exec(
			`UPDATE group_room SET state = ?, pens = ?, state_revision = ?, transition_owner = ?,
			 status = ?, updated_at = ? WHERE code = ?`,
			stateJson,
			finalPens ? JSON.stringify(finalPens) : room.pens,
			nextState.revision,
			callerId,
			nextState.phase === "match_end" ? "ended" : "playing",
			now,
			code
		);
		this.touch(callerId);
		return {
			command_id: commandId,
			package: pkg,
			revision: nextState.revision,
			state: nextState,
			status: "committed",
			turn,
		};
	}

	private turnsSince(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): Record<string, unknown>[] {
		this.requireMember(code, callerId);
		const matchNo = readInt(body.p_match_no, "match");
		const after = readInt(body.p_after_revision, "revision");
		this.touch(callerId);
		return this.sql
			.exec<GroupTurnRow>(
				`SELECT revision, turn, command_id, package, state FROM group_turn
				 WHERE match_no = ? AND revision > ? ORDER BY revision LIMIT ?`,
				matchNo,
				after,
				MAX_TURNS_RETURNED
			)
			.toArray()
			.map((row) => toTurnReceipt(row, "committed"));
	}

	// Round transitions ("next round") are computed by the last shooter and
	// saved here as a full snapshot.
	private commitFrame(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): GroupRoomAnswer {
		this.requireMember(code, callerId);
		const matchNo = readInt(body.p_match_no, "match");
		const expected = readInt(body.p_expected_revision, "revision");
		const nextState = body.p_state;
		if (!isMatchState(nextState) || jsonBytes(nextState) > MAX_STATE_BYTES) {
			throw invalid("invalid group frame");
		}
		const room = this.mustReadRoom(code);
		const current = this.currentState(room);
		const status = toStatus(room.status);
		const sameMatch =
			room.match_no === matchNo &&
			current !== null &&
			current.matchId === nextState.matchId &&
			(status === "playing" || status === "ended");
		if (!sameMatch || nextState.revision <= room.state_revision) {
			// Already applied, or about a match that is gone: nothing to do.
			return this.answer(code, callerId);
		}
		if (expected !== room.state_revision) {
			throw stale();
		}
		const pens = body.p_pens;
		this.sql.exec(
			`UPDATE group_room SET state = ?, pens = ?, state_revision = ?, status = ?,
			 updated_at = ? WHERE code = ?`,
			JSON.stringify(nextState),
			pens && typeof pens === "object" ? JSON.stringify(pens) : room.pens,
			nextState.revision,
			nextState.phase === "match_end" ? "ended" : "playing",
			Date.now(),
			code
		);
		this.touch(callerId);
		return this.answer(code, callerId);
	}

	// ---- leaving -------------------------------------------------------------

	private leave(
		code: string,
		callerId: string
	): GroupRoomAnswer | { ok: true } {
		const member = this.readMember(callerId);
		if (!member) {
			return { ok: true };
		}
		this.removeFromDesk(code, member);
		return { ok: true };
	}

	private reportAbsent(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): GroupRoomAnswer {
		this.requireMember(code, callerId);
		this.touch(callerId);
		const matchNo = readInt(body.p_match_no, "match");
		const targetId = body.p_target;
		const room = this.mustReadRoom(code);
		const target =
			typeof targetId === "string" ? this.readMember(targetId) : null;
		if (
			!target ||
			target.user_id === callerId ||
			target.present === 0 ||
			matchNo !== room.match_no
		) {
			return this.answer(code, callerId);
		}

		this.sql.exec(
			"INSERT OR IGNORE INTO group_vote (match_no, reporter, target) VALUES (?, ?, ?)",
			matchNo,
			callerId,
			target.user_id
		);
		const voters = new Set(
			this.sql
				.exec<GroupVoteRow>(
					"SELECT reporter, target FROM group_vote WHERE match_no = ? AND target = ?",
					matchNo,
					target.user_id
				)
				.toArray()
				.map((v) => v.reporter)
		);
		const others = this.members().filter(
			(m) => m.present === 1 && m.user_id !== target.user_id
		);
		const everyoneAgrees = others.every((m) => voters.has(m.user_id));
		const silent = Date.now() - target.last_seen >= SILENT_DROP_MS;
		if (everyoneAgrees || silent) {
			this.removeFromDesk(code, target);
		} else {
			this.bumpRoster(code);
		}
		return this.answer(code, callerId);
	}

	private removeFromDesk(code: string, member: GroupMemberRow): void {
		const room = this.mustReadRoom(code);
		const status = toStatus(room.status);
		if (status === "waiting" || status === "terms") {
			// Free the seat so somebody else can take it.
			this.sql.exec(
				"DELETE FROM group_member WHERE user_id = ?",
				member.user_id
			);
			this.refreshLobbyStatus(code);
			this.bumpRoster(code);
			return;
		}

		this.sql.exec(
			"UPDATE group_member SET present = 0 WHERE user_id = ?",
			member.user_id
		);
		const stillHere = this.members().filter((m) => m.present === 1).length;
		if (status === "playing") {
			const state = this.currentState(room);
			if (state) {
				const next = withdrawSeat(state, member.seat, room.size);
				if (next) {
					// Whoever is still here and sits first starts the next round.
					const owner =
						next.phase === "round_result"
							? (this.members().find((m) => m.present === 1)?.user_id ??
								room.transition_owner)
							: room.transition_owner;
					this.sql.exec(
						`UPDATE group_room SET state = ?, state_revision = ?, status = ?,
						 transition_owner = ?, updated_at = ? WHERE code = ?`,
						JSON.stringify(next),
						next.revision,
						next.phase === "match_end" ? "ended" : "playing",
						owner,
						Date.now(),
						code
					);
				}
			}
		}
		if (stillHere < 2) {
			this.sql.exec(
				"UPDATE group_room SET status = 'closed', updated_at = ? WHERE code = ?",
				Date.now(),
				code
			);
		}
		this.bumpRoster(code);
	}

	// ---- helpers -------------------------------------------------------------

	private refreshLobbyStatus(code: string): void {
		const room = this.mustReadRoom(code);
		const status = toStatus(room.status);
		if (status !== "waiting" && status !== "terms") {
			return;
		}
		const full = this.members().length >= room.size;
		this.sql.exec(
			"UPDATE group_room SET status = ?, updated_at = ? WHERE code = ?",
			full ? "terms" : "waiting",
			Date.now(),
			code
		);
	}

	private bumpRoster(code: string): void {
		this.sql.exec(
			"UPDATE group_room SET roster_revision = roster_revision + 1, updated_at = ? WHERE code = ?",
			Date.now(),
			code
		);
	}

	private touch(callerId: string): void {
		this.sql.exec(
			"UPDATE group_member SET last_seen = ? WHERE user_id = ?",
			Date.now(),
			callerId
		);
	}

	private requireMember(code: string, callerId: string): GroupMemberRow {
		if (!this.readRoom(code)) {
			throw new GroupError("that desk is not open any more.", "P0002", 404);
		}
		const member = this.readMember(callerId);
		if (!member) {
			throw new GroupError("not seated at this desk", "42501", 403);
		}
		return member;
	}

	private currentState(room: GroupRoomRow): GroupMatchState | null {
		const parsed = parseJson<unknown>(room.state);
		return isMatchState(parsed) ? parsed : null;
	}

	private readRoom(code: string): GroupRoomRow | null {
		return (
			this.sql
				.exec<GroupRoomRow>("SELECT * FROM group_room WHERE code = ?", code)
				.toArray()[0] ?? null
		);
	}

	private mustReadRoom(code: string): GroupRoomRow {
		const room = this.readRoom(code);
		if (!room) {
			throw new GroupError("that desk is not open any more.", "P0002", 404);
		}
		return room;
	}

	private readMember(userId: string): GroupMemberRow | null {
		return (
			this.sql
				.exec<GroupMemberRow>(
					"SELECT * FROM group_member WHERE user_id = ?",
					userId
				)
				.toArray()[0] ?? null
		);
	}

	private members(): GroupMemberRow[] {
		return this.sql
			.exec<GroupMemberRow>("SELECT * FROM group_member ORDER BY seat")
			.toArray();
	}

	private answer(code: string, callerId: string): GroupRoomAnswer {
		const room = this.mustReadRoom(code);
		const me = this.readMember(callerId);
		if (!me) {
			throw new GroupError("not seated at this desk", "42501", 403);
		}
		const votes = this.sql
			.exec<GroupVoteRow>(
				"SELECT reporter, target FROM group_vote WHERE match_no = ?",
				room.match_no
			)
			.toArray();
		return {
			code,
			drop_votes: votes.map((v) => ({
				reporter_user_id: v.reporter,
				target_user_id: v.target,
			})),
			match_no: room.match_no,
			members: this.members().map((m) => ({
				name: m.name,
				pen: m.pen,
				present: m.present === 1,
				ready: m.ready_match === readyTarget(room),
				seat: m.seat,
				user_id: m.user_id,
			})),
			my_seat: me.seat,
			pens: parseJson<unknown>(room.pens),
			room_id: `group_${code}`,
			roster_revision: room.roster_revision,
			size: room.size,
			state: this.currentState(room),
			status: toStatus(room.status),
			topic: `realtime:group:${code}`,
			transition_owner_user_id: room.transition_owner,
			user_id: callerId,
		};
	}
}

function readyTarget(room: GroupRoomRow): number {
	return toStatus(room.status) === "ended" ? room.match_no + 1 : room.match_no;
}

// Fold a departed seat into the running match the same way the bundle's
// engine would: it is out for the rest of the match, the turn moves on if it
// was theirs, and if only one pen is left in the round, that round is decided.
function withdrawSeat(
	state: GroupMatchState,
	seat: number,
	size: number
): GroupMatchState | null {
	if (state.withdrawn.includes(seat) || state.phase === "match_end") {
		return null;
	}
	const next: GroupMatchState = {
		...state,
		outs: [...state.outs],
		roundWinners: [...state.roundWinners],
		scores: [...state.scores],
		withdrawn: [...state.withdrawn, seat].sort((a, b) => a - b),
	};
	if (!next.outs.includes(seat)) {
		next.outs = [...next.outs, seat].sort((a, b) => a - b);
	}
	next.revision += 1;

	if (next.phase !== "aiming") {
		return next;
	}
	const out = new Set(next.outs);
	const left = Array.from({ length: size }, (_, i) => i).filter(
		(s) => !out.has(s)
	);
	if (left.length >= 2) {
		if (
			next.activeSeat === seat ||
			(next.activeSeat !== null && out.has(next.activeSeat))
		) {
			next.activeSeat = nextSeat(next.activeSeat ?? seat, out, size);
			next.turn += 1;
		}
		return next;
	}
	const winner = left.length === 1 ? (left[0] ?? null) : null;
	next.roundWinners.push(winner);
	next.activeSeat = null;
	if (winner !== null) {
		next.scores[winner] = (next.scores[winner] ?? 0) + 1;
	}
	if (winner !== null && (next.scores[winner] ?? 0) >= size) {
		next.winner = winner;
		next.phase = "match_end";
	} else {
		next.phase = "round_result";
	}
	return next;
}

function toTurnReceipt(
	row: GroupTurnRow,
	status: "committed" | "duplicate"
): Record<string, unknown> {
	return {
		command_id: row.command_id,
		package: JSON.parse(row.package) as unknown,
		revision: row.revision,
		state: JSON.parse(row.state) as unknown,
		status,
		turn: row.turn,
	};
}
