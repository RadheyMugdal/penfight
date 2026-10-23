// Authoritative per-room state for "play online with friends" duels and,
// through GroupDesk (group-room.ts), 3-player group desks.
//
// One Durable Object per room code (`idFromName("duel:" + code)`), SQLite
// backed, so room membership, bouts and the turn log outlive hibernation and
// worker redeploys.
//
// Seats: the first caller to touch a room becomes the host, the second becomes
// the guest, any further caller is refused. Repeat calls from a seat's own
// player id are idempotent, so reloads and reconnects keep their seat.
//
// Bouts and turns: the game is shooter-authoritative. The shooter simulates a
// shot locally and commits the resulting "turn package" here; the realtime
// channel only carries a receipt ({bout, turn, revision, commandId}) and the
// other browser downloads the package with duel_turns_since_v1. This object is
// therefore the single ordered log both browsers replay from. Without it the
// receiver never sees the shot and the two desks drift apart.

import { GroupDesk, GroupError } from "./group-room";

const ROOM_CODE_PATTERN = /^[a-z0-9-]{1,32}$/;
const PEN_ID_PATTERN = /^[a-z0-9_-]{1,48}$/;
const COMMAND_ID_PATTERN = /^[0-9a-f-]{36}$/i;
const MAX_NAME_LENGTH = 12;
const MAX_PACKAGE_BYTES = 64 * 1024;
const MAX_BOUT = 10_000;
// A seated player sends duel_touch_v3 every 20 s while a bout is live. A
// rival silent for this long may be claimed as abandoned.
const ABANDON_AFTER_MS = 45_000;
// If only one side ever reports a result, trust it after this long.
const SINGLE_REPORT_SETTLES_AFTER_MS = 120_000;
const MAX_TURNS_RETURNED = 500;

export type DuelRole = "host" | "guest";
export type DuelRoomStatus = "waiting" | "active" | "closed";
type BoutStatus = "terms" | "playing" | "reporting" | "settled" | "void";
type ResultReason = "played" | "conceded" | "abandoned";

export interface DuelSeatAnswer {
	room_id: string;
	code: string;
	topic: string;
	role: DuelRole;
	user_id: string;
	peer_id: string | null;
	peer_name: string | null;
	status: DuelRoomStatus;
}

export interface DuelBoutAnswer {
	status: BoutStatus;
	host_pen: string | null;
	guest_pen: string | null;
	host_stake: string | null;
	guest_stake: string | null;
	moved_pen: string | null;
	moved_to_me: boolean;
	winner_id: string | null;
	result_reason: ResultReason | null;
	forfeited_user_id: string | null;
	claim_after_ms: number | null;
}

export interface DuelTurnReceipt {
	status: "committed" | "duplicate";
	revision: number;
	turn: number;
	command_id: string;
	package: unknown;
}

interface RoomRow {
	code: string;
	host_id: string;
	host_name: string;
	guest_id: string | null;
	guest_name: string | null;
	status: string;
	created_at: number;
	updated_at: number;
}

interface BoutRow {
	bout: number;
	status: string;
	host_pen: string | null;
	guest_pen: string | null;
	host_stake: string | null;
	guest_stake: string | null;
	host_ready_at: number | null;
	guest_ready_at: number | null;
	revision: number;
	last_turn: number;
	host_touch: number | null;
	guest_touch: number | null;
	started_at: number | null;
	host_report: string | null;
	guest_report: string | null;
	first_report_at: number | null;
	winner_id: string | null;
	result_reason: string | null;
	forfeited_user_id: string | null;
	moved_pen: string | null;
	updated_at: number;
}

interface TurnRow {
	revision: number;
	turn: number;
	command_id: string;
	package: string;
}

interface StoredReport {
	winner: string;
	host_score: number | null;
	guest_score: number | null;
}

interface Seat {
	room: RoomRow;
	role: DuelRole;
	peerId: string | null;
}

// Minimal local shapes for the Cloudflare SQLite storage API, so this file
// typechecks under the repo's Bun-only tsconfig and stays dependency-free
// (same approach as realtime-worker.ts).
interface SqlCursor<T> {
	toArray(): T[];
}

interface SqlStorageLike {
	exec<T = Record<string, unknown>>(
		query: string,
		...bindings: unknown[]
	): SqlCursor<T>;
}

interface DuelStateLike {
	storage: { sql: SqlStorageLike };
}

class DuelError extends Error {
	readonly code: string;
	readonly httpStatus: number;

	constructor(message: string, code: string, httpStatus: number) {
		super(message);
		this.code = code;
		this.httpStatus = httpStatus;
	}
}

// Error codes mirror what the game bundle already understands (they were
// Postgres SQLSTATEs in the original backend):
//   42501  not seated at this desk            -> client gives up
//   22023  bad stake                          -> client retries without stake
//   P0001  turn rejected (stale / bout over)  -> client cancels the shot
//   P0002  no such bout yet                   -> client treats as "not started"
//   55000  bout not live yet                  -> client keeps retrying
const notSeated = () => new DuelError("not seated at this desk", "42501", 403);
const noSuchBout = () => new DuelError("no such bout", "P0002", 404);
const invalid = (message: string) => new DuelError(message, "invalid", 400);

export function normaliseRoomCode(raw: unknown): string | null {
	if (typeof raw !== "string") {
		return null;
	}
	const code = raw.trim().toLowerCase();
	return ROOM_CODE_PATTERN.test(code) ? code : null;
}

export function normalisePlayerName(raw: unknown): string {
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

function readBoutNumber(raw: unknown): number {
	if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 0 || raw > MAX_BOUT) {
		throw invalid("invalid bout");
	}
	return raw;
}

function readPen(raw: unknown): string {
	if (typeof raw !== "string" || !PEN_ID_PATTERN.test(raw)) {
		throw invalid("invalid pen");
	}
	return raw;
}

function readOptionalPen(raw: unknown): string | null {
	if (raw === null || raw === undefined || raw === "") {
		return null;
	}
	return readPen(raw);
}

function readOptionalScore(raw: unknown): number | null {
	return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
}

function toRoomStatus(raw: string): DuelRoomStatus {
	if (raw === "active" || raw === "closed") {
		return raw;
	}
	return "waiting";
}

function toBoutStatus(raw: string): BoutStatus {
	if (
		raw === "playing" ||
		raw === "reporting" ||
		raw === "settled" ||
		raw === "void"
	) {
		return raw;
	}
	return "terms";
}

function toResultReason(raw: string | null): ResultReason | null {
	if (raw === "played" || raw === "conceded" || raw === "abandoned") {
		return raw;
	}
	return null;
}

function isFinal(status: BoutStatus): boolean {
	return status === "settled" || status === "void";
}

export class DuelRoom {
	private readonly sql: SqlStorageLike;
	private readonly group: GroupDesk;

	constructor(state: DuelStateLike, _env: unknown) {
		this.sql = state.storage.sql;
		this.group = new GroupDesk(this.sql);
		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS room (
				code TEXT PRIMARY KEY,
				host_id TEXT NOT NULL,
				host_name TEXT NOT NULL DEFAULT '',
				guest_id TEXT,
				guest_name TEXT,
				status TEXT NOT NULL DEFAULT 'waiting',
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);
		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS bout (
				bout INTEGER PRIMARY KEY,
				status TEXT NOT NULL DEFAULT 'terms',
				host_pen TEXT,
				guest_pen TEXT,
				host_stake TEXT,
				guest_stake TEXT,
				host_ready_at INTEGER,
				guest_ready_at INTEGER,
				revision INTEGER NOT NULL DEFAULT 0,
				last_turn INTEGER NOT NULL DEFAULT 0,
				host_touch INTEGER,
				guest_touch INTEGER,
				started_at INTEGER,
				host_report TEXT,
				guest_report TEXT,
				first_report_at INTEGER,
				winner_id TEXT,
				result_reason TEXT,
				forfeited_user_id TEXT,
				moved_pen TEXT,
				updated_at INTEGER NOT NULL
			)
		`);
		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS turn (
				bout INTEGER NOT NULL,
				revision INTEGER NOT NULL,
				turn INTEGER NOT NULL,
				command_id TEXT NOT NULL,
				shooter_id TEXT NOT NULL,
				package TEXT NOT NULL,
				created_at INTEGER NOT NULL,
				PRIMARY KEY (bout, revision),
				UNIQUE (bout, command_id)
			)
		`);
	}

	async fetch(request: Request): Promise<Response> {
		let body: Record<string, unknown>;
		try {
			body = (await request.json()) as Record<string, unknown>;
		} catch {
			return jsonError("invalid request body", "invalid", 400);
		}

		const fn = request.headers.get("X-Penfight-Fn") ?? "";
		const callerId = request.headers.get("X-Penfight-Player") ?? "";
		const code = normaliseRoomCode(body.p_code);

		if (!callerId) {
			return jsonError("identity unavailable", "session_unavailable", 401);
		}
		if (!code) {
			return jsonError("invalid room", "invalid", 400);
		}

		try {
			const answer = fn.startsWith("group_")
				? this.group.dispatch(fn, code, callerId, body)
				: this.dispatch(fn, code, callerId, body);
			return jsonOk(answer);
		} catch (error) {
			if (error instanceof DuelError || error instanceof GroupError) {
				return jsonError(error.message, error.code, error.httpStatus);
			}
			throw error;
		}
	}

	private dispatch(
		fn: string,
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): unknown {
		switch (fn) {
			case "duel_create_room_v2":
			case "duel_join_room_v2":
				return this.claimSeat(code, callerId, normalisePlayerName(body.p_name));
			case "duel_rename_v2":
				return this.rename(code, callerId, normalisePlayerName(body.p_name));
			case "duel_ready_v3":
				return this.ready(code, callerId, body);
			case "duel_bout_status_v2":
				return this.boutStatus(code, callerId, body, false);
			case "duel_touch_v3":
				return this.boutStatus(code, callerId, body, true);
			case "duel_commit_turn_v1":
				return this.commitTurn(code, callerId, body);
			case "duel_turns_since_v1":
				return this.turnsSince(code, callerId, body);
			case "duel_report_v2":
				return this.report(code, callerId, body);
			case "duel_concede_v3":
				return this.concede(code, callerId, body);
			case "duel_claim_abandon_v3":
				return this.claimAbandon(code, callerId, body);
			case "duel_finish_v1":
				return this.finish(code, callerId, body);
			default:
				throw new DuelError(`unsupported function ${fn}`, "invalid", 404);
		}
	}

	// ---- seats ---------------------------------------------------------------

	private claimSeat(code: string, callerId: string, name: string): DuelSeatAnswer {
		const existing = this.readRoom(code);
		const now = Date.now();

		if (!existing) {
			this.sql.exec(
				`INSERT INTO room (code, host_id, host_name, status, created_at, updated_at)
				 VALUES (?, ?, ?, 'waiting', ?, ?)`,
				code,
				callerId,
				name,
				now,
				now
			);
			return this.seatAnswer(code, "host");
		}

		if (existing.host_id === callerId) {
			this.sql.exec(
				"UPDATE room SET host_name = ?, updated_at = ? WHERE code = ?",
				name,
				now,
				code
			);
			return this.seatAnswer(code, "host");
		}

		if (existing.guest_id === callerId) {
			this.sql.exec(
				"UPDATE room SET guest_name = ?, updated_at = ? WHERE code = ?",
				name,
				now,
				code
			);
			return this.seatAnswer(code, "guest");
		}

		if (existing.guest_id === null) {
			this.sql.exec(
				`UPDATE room SET guest_id = ?, guest_name = ?, status = 'active', updated_at = ?
				 WHERE code = ?`,
				callerId,
				name,
				now,
				code
			);
			return this.seatAnswer(code, "guest");
		}

		throw new DuelError("this desk is already taken", "room_full", 409);
	}

	private rename(code: string, callerId: string, name: string): unknown {
		const seat = this.requireSeat(code, callerId);
		const column = seat.role === "host" ? "host_name" : "guest_name";
		this.sql.exec(
			`UPDATE room SET ${column} = ?, updated_at = ? WHERE code = ?`,
			name,
			Date.now(),
			code
		);
		return { ok: true, status: "ok" };
	}

	// ---- bouts ---------------------------------------------------------------

	private ready(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): DuelBoutAnswer {
		const seat = this.requireSeat(code, callerId);
		const boutNo = readBoutNumber(body.p_bout);
		const pen = readPen(body.p_pen);
		const stake = readOptionalPen(body.p_stake);
		if (stake !== null && stake !== pen) {
			throw new DuelError("you can only stake the pen you play", "22023", 400);
		}

		const now = Date.now();
		let row = this.readBout(boutNo);
		if (!row) {
			this.sql.exec(
				"INSERT INTO bout (bout, status, updated_at) VALUES (?, 'terms', ?)",
				boutNo,
				now
			);
			row = this.mustReadBout(boutNo);
		}

		if (toBoutStatus(row.status) === "terms") {
			const side = seat.role;
			this.sql.exec(
				`UPDATE bout SET ${side}_pen = ?, ${side}_stake = ?, ${side}_ready_at = ?,
				 ${side}_touch = ?, updated_at = ? WHERE bout = ?`,
				pen,
				stake,
				now,
				now,
				now,
				boutNo
			);
			row = this.mustReadBout(boutNo);
			const bothReady = row.host_ready_at !== null && row.guest_ready_at !== null;
			if (bothReady && seat.peerId) {
				this.sql.exec(
					`UPDATE bout SET status = 'playing', started_at = ?, host_touch = ?,
					 guest_touch = ?, updated_at = ? WHERE bout = ?`,
					now,
					now,
					now,
					now,
					boutNo
				);
				this.sql.exec(
					"UPDATE room SET status = 'active', updated_at = ? WHERE code = ?",
					now,
					code
				);
				row = this.mustReadBout(boutNo);
			}
		}

		return this.boutAnswer(row, seat, callerId);
	}

	private boutStatus(
		code: string,
		callerId: string,
		body: Record<string, unknown>,
		touch: boolean
	): DuelBoutAnswer {
		const seat = this.requireSeat(code, callerId);
		const boutNo = readBoutNumber(body.p_bout);
		let row = this.readBout(boutNo);
		if (!row) {
			throw noSuchBout();
		}
		if (touch && !isFinal(toBoutStatus(row.status))) {
			this.sql.exec(
				`UPDATE bout SET ${seat.role}_touch = ?, updated_at = ? WHERE bout = ?`,
				Date.now(),
				Date.now(),
				boutNo
			);
			row = this.mustReadBout(boutNo);
		}
		row = this.settleLoneReport(row, seat);
		return this.boutAnswer(row, seat, callerId);
	}

	// ---- turns ---------------------------------------------------------------

	private commitTurn(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): DuelTurnReceipt {
		this.requireSeat(code, callerId);
		const boutNo = readBoutNumber(body.p_bout);
		const turn = body.p_turn;
		const baseRevision = body.p_base_revision;
		const commandId = body.p_command;
		const pkg = body.p_package;

		if (
			typeof turn !== "number" ||
			!Number.isInteger(turn) ||
			turn < 1 ||
			typeof baseRevision !== "number" ||
			!Number.isInteger(baseRevision) ||
			baseRevision < 0 ||
			typeof commandId !== "string" ||
			!COMMAND_ID_PATTERN.test(commandId) ||
			!pkg ||
			typeof pkg !== "object" ||
			Array.isArray(pkg)
		) {
			throw invalid("invalid turn");
		}
		const packageRecord = pkg as Record<string, unknown>;
		if (
			packageRecord.commandId !== commandId ||
			packageRecord.shooterId !== callerId ||
			packageRecord.bout !== boutNo ||
			packageRecord.turn !== turn ||
			packageRecord.baseRevision !== baseRevision
		) {
			throw invalid("turn package does not match its command");
		}
		const packageJson = JSON.stringify(pkg);
		if (new TextEncoder().encode(packageJson).byteLength > MAX_PACKAGE_BYTES) {
			throw invalid("turn package too large");
		}

		const row = this.readBout(boutNo);
		if (!row) {
			// The ready call may still be in flight; the client retries.
			throw new DuelError("the bout has not started yet", "55000", 409);
		}

		const duplicate = this.sql
			.exec<TurnRow>(
				"SELECT revision, turn, command_id, package FROM turn WHERE bout = ? AND command_id = ?",
				boutNo,
				commandId
			)
			.toArray()[0];
		if (duplicate) {
			return toReceipt(duplicate, "duplicate");
		}

		const status = toBoutStatus(row.status);
		if (status === "terms") {
			throw new DuelError("the bout has not started yet", "55000", 409);
		}
		if (status !== "playing") {
			throw new DuelError("this bout is over", "P0001", 409);
		}
		if (baseRevision !== row.revision) {
			throw new DuelError("the desk moved on; catch up first", "P0001", 409);
		}
		if (turn <= row.last_turn) {
			throw new DuelError("that turn was already played", "P0001", 409);
		}

		const revision = row.revision + 1;
		const now = Date.now();
		this.sql.exec(
			`INSERT INTO turn (bout, revision, turn, command_id, shooter_id, package, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			boutNo,
			revision,
			turn,
			commandId,
			callerId,
			packageJson,
			now
		);
		const seatColumn =
			this.readRoom(code)?.host_id === callerId ? "host_touch" : "guest_touch";
		this.sql.exec(
			`UPDATE bout SET revision = ?, last_turn = ?, ${seatColumn} = ?, updated_at = ?
			 WHERE bout = ?`,
			revision,
			turn,
			now,
			now,
			boutNo
		);
		return {
			command_id: commandId,
			package: pkg,
			revision,
			status: "committed",
			turn,
		};
	}

	private turnsSince(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): DuelTurnReceipt[] {
		this.requireSeat(code, callerId);
		const boutNo = readBoutNumber(body.p_bout);
		const after = body.p_after_revision;
		if (typeof after !== "number" || !Number.isInteger(after) || after < 0) {
			throw invalid("invalid revision");
		}
		return this.sql
			.exec<TurnRow>(
				`SELECT revision, turn, command_id, package FROM turn
				 WHERE bout = ? AND revision > ? ORDER BY revision LIMIT ?`,
				boutNo,
				after,
				MAX_TURNS_RETURNED
			)
			.toArray()
			.map((row) => toReceipt(row, "committed"));
	}

	// ---- results -------------------------------------------------------------

	private report(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): DuelBoutAnswer {
		const seat = this.requireSeat(code, callerId);
		const boutNo = readBoutNumber(body.p_bout);
		let row = this.readBout(boutNo);
		if (!row) {
			throw noSuchBout();
		}
		const status = toBoutStatus(row.status);
		if (isFinal(status)) {
			return this.boutAnswer(row, seat, callerId);
		}

		const winner = body.p_winner;
		if (
			typeof winner !== "string" ||
			(winner !== callerId && winner !== seat.peerId)
		) {
			throw invalid("the winner must be one of the two players");
		}
		const report: StoredReport = {
			guest_score: readOptionalScore(body.p_guest_score),
			host_score: readOptionalScore(body.p_host_score),
			winner,
		};
		const now = Date.now();
		this.sql.exec(
			`UPDATE bout SET ${seat.role}_report = ?, status = 'reporting',
			 first_report_at = COALESCE(first_report_at, ?), updated_at = ? WHERE bout = ?`,
			JSON.stringify(report),
			now,
			now,
			boutNo
		);
		row = this.mustReadBout(boutNo);

		const hostReport = parseReport(row.host_report);
		const guestReport = parseReport(row.guest_report);
		if (hostReport && guestReport) {
			if (hostReport.winner === guestReport.winner) {
				row = this.settle(row, seat.room, hostReport.winner, "played", null);
			} else {
				this.sql.exec(
					"UPDATE bout SET status = 'void', updated_at = ? WHERE bout = ?",
					now,
					boutNo
				);
				row = this.mustReadBout(boutNo);
			}
		}
		return this.boutAnswer(row, seat, callerId);
	}

	private concede(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): DuelBoutAnswer {
		const seat = this.requireSeat(code, callerId);
		const boutNo = readBoutNumber(body.p_bout);
		let row = this.readBout(boutNo);
		if (!row) {
			throw noSuchBout();
		}
		const status = toBoutStatus(row.status);
		if (status === "terms") {
			row = this.voidBout(boutNo);
		} else if (!isFinal(status) && seat.peerId) {
			row = this.settle(row, seat.room, seat.peerId, "conceded", callerId);
		}
		return this.boutAnswer(row, seat, callerId);
	}

	private claimAbandon(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): DuelBoutAnswer {
		const seat = this.requireSeat(code, callerId);
		const boutNo = readBoutNumber(body.p_bout);
		let row = this.readBout(boutNo);
		if (!row) {
			throw noSuchBout();
		}
		const status = toBoutStatus(row.status);
		if (status !== "playing" || !seat.peerId) {
			return this.boutAnswer(row, seat, callerId);
		}

		const peerRole: DuelRole = seat.role === "host" ? "guest" : "host";
		const peerTouch = row[`${peerRole}_touch`] ?? row.started_at ?? row.updated_at;
		const silentFor = Date.now() - peerTouch;
		if (silentFor >= ABANDON_AFTER_MS) {
			row = this.settle(row, seat.room, callerId, "abandoned", seat.peerId);
			return this.boutAnswer(row, seat, callerId);
		}
		return {
			...this.boutAnswer(row, seat, callerId),
			claim_after_ms: ABANDON_AFTER_MS - silentFor,
		};
	}

	private finish(
		code: string,
		callerId: string,
		body: Record<string, unknown>
	): { status: "finished" | "playing" } {
		this.requireSeat(code, callerId);
		const boutNo = readBoutNumber(body.p_bout);
		const row = this.readBout(boutNo);
		if (row && toBoutStatus(row.status) === "playing") {
			return { status: "playing" };
		}
		if (row && toBoutStatus(row.status) === "terms") {
			this.voidBout(boutNo);
		}
		this.sql.exec(
			"UPDATE room SET status = 'closed', updated_at = ? WHERE code = ?",
			Date.now(),
			code
		);
		return { status: "finished" };
	}

	private settle(
		row: BoutRow,
		room: RoomRow,
		winnerId: string,
		reason: ResultReason,
		forfeitedUserId: string | null
	): BoutRow {
		const loserIsHost = winnerId !== room.host_id;
		const movedPen = loserIsHost ? row.host_stake : row.guest_stake;
		this.sql.exec(
			`UPDATE bout SET status = 'settled', winner_id = ?, result_reason = ?,
			 forfeited_user_id = ?, moved_pen = ?, updated_at = ? WHERE bout = ?`,
			winnerId,
			reason,
			forfeitedUserId,
			movedPen,
			Date.now(),
			row.bout
		);
		return this.mustReadBout(row.bout);
	}

	private settleLoneReport(row: BoutRow, seat: Seat): BoutRow {
		if (
			toBoutStatus(row.status) !== "reporting" ||
			row.first_report_at === null ||
			Date.now() - row.first_report_at < SINGLE_REPORT_SETTLES_AFTER_MS
		) {
			return row;
		}
		const lone = parseReport(row.host_report) ?? parseReport(row.guest_report);
		return lone ? this.settle(row, seat.room, lone.winner, "played", null) : row;
	}

	private voidBout(boutNo: number): BoutRow {
		this.sql.exec(
			"UPDATE bout SET status = 'void', updated_at = ? WHERE bout = ?",
			Date.now(),
			boutNo
		);
		return this.mustReadBout(boutNo);
	}

	// ---- reads & answers -----------------------------------------------------

	private requireSeat(code: string, callerId: string): Seat {
		const room = this.readRoom(code);
		if (!room) {
			throw new DuelError("no such room", "invalid", 404);
		}
		if (room.host_id === callerId) {
			return { peerId: room.guest_id, role: "host", room };
		}
		if (room.guest_id === callerId) {
			return { peerId: room.host_id, role: "guest", room };
		}
		throw notSeated();
	}

	private readRoom(code: string): RoomRow | null {
		const rows = this.sql
			.exec<RoomRow>("SELECT * FROM room WHERE code = ?", code)
			.toArray();
		return rows[0] ?? null;
	}

	private readBout(boutNo: number): BoutRow | null {
		const rows = this.sql
			.exec<BoutRow>("SELECT * FROM bout WHERE bout = ?", boutNo)
			.toArray();
		return rows[0] ?? null;
	}

	private mustReadBout(boutNo: number): BoutRow {
		const row = this.readBout(boutNo);
		if (!row) {
			throw new Error(`bout ${boutNo} vanished mid-update`);
		}
		return row;
	}

	private boutAnswer(row: BoutRow, _seat: Seat, callerId: string): DuelBoutAnswer {
		const status = toBoutStatus(row.status);
		const settled = status === "settled";
		return {
			claim_after_ms: null,
			forfeited_user_id: settled ? row.forfeited_user_id : null,
			guest_pen: row.guest_pen,
			guest_stake: row.guest_stake,
			host_pen: row.host_pen,
			host_stake: row.host_stake,
			moved_pen: settled ? row.moved_pen : null,
			moved_to_me: settled && row.moved_pen !== null && row.winner_id === callerId,
			result_reason: settled ? toResultReason(row.result_reason) : null,
			status,
			winner_id: settled ? row.winner_id : null,
		};
	}

	private seatAnswer(code: string, role: DuelRole): DuelSeatAnswer {
		const room = this.readRoom(code);
		if (!room) {
			throw new Error(`room ${code} vanished mid-claim`);
		}
		const isHost = role === "host";
		const peerId = isHost ? room.guest_id : room.host_id;
		const peerName = isHost ? room.guest_name : room.host_name;
		return {
			code,
			peer_id: peerId,
			peer_name: peerId ? (peerName ?? null) : null,
			role,
			room_id: `room_${code}`,
			status: toRoomStatus(room.status),
			topic: `realtime:duel:${code}`,
			user_id: isHost ? room.host_id : (room.guest_id ?? ""),
		};
	}
}

function parseReport(raw: string | null): StoredReport | null {
	if (!raw) {
		return null;
	}
	try {
		const parsed = JSON.parse(raw) as StoredReport;
		return typeof parsed.winner === "string" ? parsed : null;
	} catch {
		return null;
	}
}

function toReceipt(row: TurnRow, status: "committed" | "duplicate"): DuelTurnReceipt {
	return {
		command_id: row.command_id,
		package: JSON.parse(row.package) as unknown,
		revision: row.revision,
		status,
		turn: row.turn,
	};
}

function jsonOk(value: unknown): Response {
	return new Response(JSON.stringify(value), {
		headers: { "Content-Type": "application/json" },
		status: 200,
	});
}

function jsonError(message: string, code: string, status: number): Response {
	return new Response(JSON.stringify({ code, message }), {
		headers: { "Content-Type": "application/json" },
		status,
	});
}
