// Pen Fight realtime server, ported from packages/api/src/realtime-server.ts
// (Phoenix Channel v1.0.0 protocol compatible) to a Cloudflare Worker running a
// WebSocket Hibernation API Durable Object.
//
// One singleton DO ("global") holds every room in memory — matching the Bun
// server's single-process behavior, so reconnects always land on the same
// state and seat assignments stay consistent. Socket-local state (connection
// id, joined topics, tracked presence) lives in WebSocket attachments so it
// survives hibernation; per-topic client lists and room presence are rebuilt
// from attachments on demand instead of kept in eager maps.

interface PresenceMeta {
	at: number;
	id: string;
	name: string;
	pen: string;
	phx_ref: string;
	seat: number;
	[key: string]: unknown;
}

interface SocketAttachment {
	connId: string;
	roomTopics: string[];
	presence: Record<string, PresenceMeta>;
}

export interface RealtimeMessage {
	topic: string;
	event: string;
	payload: Record<string, unknown>;
	ref: string | null;
}

// Minimal local sockets/types for the Cloudflare Hibernation API so this file
// typechecks with the repo's Bun-only tsconfig ("types": ["bun"]) and keeps the
// server dependency-free, exactly like realtime-server.ts.
interface WebSocketPairLike {
	0: unknown;
	1: unknown;
}

// Cloudflare-provided global (server side of the upgrade handshake); not part
// of Bun's type globals, and it emits nothing with `declare const`.
declare const WebSocketPair: new () => WebSocketPairLike;

type HibernationSocket = {
	send(data: string): void;
	serializeAttachment(data: unknown): void;
	deserializeAttachment(): unknown;
};

interface DurableObjectStateLike {
	acceptWebSocket(ws: unknown): void;
	getWebSockets(): HibernationSocket[];
}

interface RealtimeNamespace {
	idFromName(name: string): { toString(): string };
	get(
		id: { toString(): string },
	): { fetch(request: Request): Promise<Response> };
}

interface RealtimeEnv {
	REALTIME: RealtimeNamespace;
}

export default {
	async fetch(request: Request, env: RealtimeEnv): Promise<Response> {
		const upgrade = request.headers.get("Upgrade") ?? "";
		if (upgrade.toLowerCase() === "websocket") {
			const stub = env.REALTIME.get(env.REALTIME.idFromName("global"));
			return stub.fetch(request);
		}
		return new Response("Pen Fight Realtime WebSocket Server Running!", {
			status: 200,
		});
	},
};

export class RealtimeRoom {
	private readonly state: DurableObjectStateLike;

	constructor(state: DurableObjectStateLike, _env: RealtimeEnv) {
		this.state = state;
	}

	async fetch(request: Request): Promise<Response> {
		const upgrade = request.headers.get("Upgrade");
		if (upgrade !== null && upgrade.toLowerCase() === "websocket") {
			const pair = new WebSocketPair();
			this.state.acceptWebSocket(pair[1]);
			const server = pair[1] as unknown as HibernationSocket;
			server.serializeAttachment({
				connId: "conn_" + Math.random().toString(36).slice(2, 9),
				roomTopics: [] as string[],
				presence: {} as Record<string, PresenceMeta>,
			} satisfies SocketAttachment);
			return new Response(null, {
				status: 101,
				webSocket: pair[0],
			} as ResponseInit);
		}
		return new Response("Pen Fight Realtime WebSocket Server Running!", {
			status: 200,
		});
	}

	webSocketMessage(ws: unknown, message: string | ArrayBuffer): void {
		const server = ws as unknown as HibernationSocket;
		const attachment = this.readAttachment(server);
		const rawString = typeof message === "string" ? message : String(message);

		let msg: RealtimeMessage;
		try {
			msg = JSON.parse(rawString) as RealtimeMessage;
		} catch {
			return;
		}

		const { topic, event, payload, ref } = msg;
		const payloadRecord = (payload ?? {}) as Record<string, unknown>;

		// 1. Heartbeat
		if (topic === "phoenix" && event === "heartbeat") {
			this.sendReply(server, ref, "phoenix");
			return;
		}

		// 2. Channel Join
		if (event === "phx_join") {
			if (!attachment.roomTopics.includes(topic)) {
				attachment.roomTopics.push(topic);
			}
			server.serializeAttachment(attachment);

			this.sendReply(server, ref, topic);
			this.sendPresenceState(server, topic);
			return;
		}

		// 3. Presence Track
		if (
			event === "presence" &&
			payloadRecord.type === "presence" &&
			payloadRecord.event === "track"
		) {
			const track = payloadRecord.payload as Record<string, unknown> | undefined;
			if (!(track && track.id)) {
				return;
			}

			const userId = String(track.id);
			const occupiedSeats = new Set<number>();
			for (const [otherId, otherMetas] of this.topicPresences(
				topic,
				attachment.connId,
			).entries()) {
				const otherMeta = otherMetas[0];
				if (
					otherId !== userId &&
					otherMeta &&
					typeof otherMeta.seat === "number" &&
					otherMeta.seat >= 0
				) {
					occupiedSeats.add(otherMeta.seat);
				}
			}

			// Host keeps seat 0 when free; guests take the lowest free seat 0..5.
			let assignedSeat =
				typeof track.seat === "number" &&
				(track.seat as number) >= 0 &&
				!occupiedSeats.has(track.seat as number)
					? (track.seat as number)
					: -1;
			if (assignedSeat < 0) {
				for (let slot = 0; slot < 6; slot++) {
					if (!occupiedSeats.has(slot)) {
						assignedSeat = slot;
						break;
					}
				}
			}

			const meta: PresenceMeta = {
				at: Number(track.at || Date.now()),
				id: userId,
				name: String(track.name || "friend"),
				pen: String(track.pen || "reynolds045"),
				phx_ref: attachment.connId + "_" + Date.now(),
				seat: assignedSeat,
			};

			attachment.presence[topic] = meta;
			server.serializeAttachment(attachment);

			// Full presence state, including the freshly tracked user.
			const statePayload: Record<string, { metas: PresenceMeta[] }> = {};
			for (const [otherId, otherMetas] of this.topicPresences(topic).entries()) {
				statePayload[otherId] = { metas: otherMetas };
			}
			server.send(
				JSON.stringify({
					event: "presence_state",
					payload: statePayload,
					ref: null,
					topic,
				}),
			);

			// Broadcast the join diff (with the uniquely assigned seat) to others.
			const joinMessage = JSON.stringify({
				event: "presence_diff",
				payload: {
					joins: { [userId]: { metas: [meta] } },
					leaves: {},
				},
				ref: null,
				topic,
			});
			for (const client of this.clientsInTopic(topic, attachment.connId)) {
				client.send(joinMessage);
			}
			return;
		}

		// 4. Broadcast events (turn, shot, pass, sync, etc.)
		if (event === "broadcast" && payloadRecord.type === "broadcast") {
			const broadcastMessage = JSON.stringify({
				event: "broadcast",
				payload: {
					event: payloadRecord.event,
					payload: payloadRecord.payload,
				},
				ref: null,
				topic,
			});
			for (const client of this.clientsInTopic(topic, attachment.connId)) {
				client.send(broadcastMessage);
			}
		}
	}

	webSocketClose(ws: unknown): void {
		const server = ws as unknown as HibernationSocket;
		const attachment = this.readAttachment(server);

		for (const topic of [...attachment.roomTopics]) {
			const meta = attachment.presence[topic];
			if (!meta) {
				continue;
			}

			const leaveMessage = JSON.stringify({
				event: "presence_diff",
				payload: {
					joins: {},
					leaves: { [meta.id]: { metas: [meta] } },
				},
				ref: null,
				topic,
			});
			for (const client of this.clientsInTopic(topic, attachment.connId)) {
				client.send(leaveMessage);
			}
		}

		attachment.roomTopics = [];
		attachment.presence = {};
		server.serializeAttachment(attachment);
	}

	webSocketError(_ws: unknown): void {
		// Client-side socket errors terminate the connection; webSocketClose
		// performs the same presence leave path regardless.
	}

	private readAttachment(server: HibernationSocket): SocketAttachment {
		return server.deserializeAttachment() as SocketAttachment;
	}

	private clientsInTopic(topic: string, excludeConnId?: string): HibernationSocket[] {
		const clients: HibernationSocket[] = [];
		for (const ws of this.state.getWebSockets()) {
			const attachment = this.readAttachment(ws);
			if (
				attachment.roomTopics.includes(topic) &&
				attachment.connId !== excludeConnId
			) {
				clients.push(ws);
			}
		}
		return clients;
	}

	private topicPresences(
		topic: string,
		excludeConnId?: string,
	): Map<string, PresenceMeta[]> {
		const presenceMap = new Map<string, PresenceMeta[]>();
		for (const ws of this.state.getWebSockets()) {
			const attachment = this.readAttachment(ws);
			const meta = attachment.presence[topic];
			if (meta && attachment.connId !== excludeConnId) {
				presenceMap.set(meta.id, [meta]);
			}
		}
		return presenceMap;
	}

	private sendReply(server: HibernationSocket, ref: unknown, topic: string): void {
		server.send(
			JSON.stringify({
				event: "phx_reply",
				payload: { response: {}, status: "ok" },
				ref,
				topic,
			}),
		);
	}

	private sendPresenceState(server: HibernationSocket, topic: string): void {
		const statePayload: Record<string, { metas: PresenceMeta[] }> = {};
		for (const [userId, metas] of this.topicPresences(topic).entries()) {
			statePayload[userId] = { metas };
		}
		if (Object.keys(statePayload).length === 0) {
			return;
		}
		server.send(
			JSON.stringify({
				event: "presence_state",
				payload: statePayload,
				ref: null,
				topic,
			}),
		);
	}
}
