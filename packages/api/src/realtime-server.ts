// Self-hosted Realtime WebSocket Server for Pen Fight (Phoenix Channel v1.0.0 protocol compatible)
import type { ServerWebSocket } from "bun";

interface PresenceMeta {
	at: number;
	id: string;
	name: string;
	pen: string;
	phx_ref: string;
	seat: number;
	[key: string]: unknown;
}

interface SocketData {
	id: string;
	presence: Map<string, PresenceMeta>; // topic -> meta
	roomTopics: Set<string>;
}

interface RoomSettings {
	hostId: string | null;
	targetSize: number;
}

const rooms = new Map<string, Map<string, PresenceMeta[]>>(); // topic -> (userId -> metas)
const roomSettings = new Map<string, RoomSettings>(); // topic -> RoomSettings
const clientsByTopic = new Map<string, Set<ServerWebSocket<SocketData>>>();

const PORT = 3002;

Bun.serve<SocketData>({
	fetch(req: Request, server: any): Response | undefined {
		const url = new URL(req.url);
		if (
			url.pathname === "/realtime/v1/websocket" ||
			url.pathname === "/realtime" ||
			url.pathname === "/"
		) {
			const upgraded = server.upgrade(req, {
				data: {
					id: "conn_" + Math.random().toString(36).slice(2, 9),
					presence: new Map<string, PresenceMeta>(),
					roomTopics: new Set<string>(),
				},
			});
			if (upgraded) {
				return undefined;
			}
		}
		return new Response("Pen Fight Realtime WebSocket Server Running!", {
			status: 200,
		});
	},
	port: PORT,
	websocket: {
		close(ws: ServerWebSocket<SocketData>) {
			for (const topic of ws.data.roomTopics) {
				const roomClients = clientsByTopic.get(topic);
				if (roomClients) {
					roomClients.delete(ws);
					if (roomClients.size === 0) {
						clientsByTopic.delete(topic);
					}
				}

				const meta = ws.data.presence.get(topic);
				if (meta) {
					const roomMap = rooms.get(topic);
					if (roomMap) {
						roomMap.delete(meta.id);
						if (roomMap.size === 0) {
							rooms.delete(topic);
							roomSettings.delete(topic);
						}
					}

					// Broadcast presence_diff (leaves)
					const leaveMsg = JSON.stringify({
						event: "presence_diff",
						payload: {
							joins: {},
							leaves: { [meta.id]: { metas: [meta] } },
						},
						ref: null,
						topic,
					});

					if (roomClients) {
						for (const client of roomClients) {
							if (client.readyState === 1) {
								client.send(leaveMsg);
							}
						}
					}
				}
			}
		},
		message(ws: ServerWebSocket<SocketData>, rawMessage: string | Buffer) {
			let msg: { topic: string; event: string; payload: any; ref: string };
			try {
				msg = JSON.parse(String(rawMessage));
			} catch {
				return;
			}

			const { topic, event, payload, ref } = msg;

			// 1. Heartbeat
			if (topic === "phoenix" && event === "heartbeat") {
				ws.send(
					JSON.stringify({
						event: "phx_reply",
						payload: { response: {}, status: "ok" },
						ref,
						topic: "phoenix",
					})
				);
				return;
			}

			// 2. Channel Join
			if (event === "phx_join") {
				ws.data.roomTopics.add(topic);
				if (!clientsByTopic.has(topic)) {
					clientsByTopic.set(topic, new Set());
				}
				clientsByTopic.get(topic)!.add(ws);

				const currentSettings = roomSettings.get(topic);

				// Acknowledge join with current room targetSize
				ws.send(
					JSON.stringify({
						event: "phx_reply",
						payload: {
							response: { targetSize: currentSettings?.targetSize ?? 3 },
							status: "ok",
						},
						ref,
						topic,
					})
				);

				// Send current presence state if any
				const roomPresences = rooms.get(topic);
				if (roomPresences && roomPresences.size > 0) {
					const statePayload: Record<string, { metas: PresenceMeta[] }> = {};
					for (const [userId, metas] of roomPresences.entries()) {
						statePayload[userId] = { metas };
					}
					ws.send(
						JSON.stringify({
							event: "presence_state",
							payload: statePayload,
							ref: null,
							topic,
						})
					);
				}
				return;
			}

			// 3. Presence Track
			if (
				event === "presence" &&
				payload?.type === "presence" &&
				payload?.event === "track"
			) {
				const p = payload.payload;
				if (!(p && p.id)) {
					return;
				}

				const userId = String(p.id);

				if (!rooms.has(topic)) {
					rooms.set(topic, new Map());
				}
				const roomMap = rooms.get(topic)!;

				// Initialize or update room settings
				const isHost = Boolean(p.isHost || p.seat === 0);
				let requestedSize = Number(p.size);
				if (
					Number.isNaN(requestedSize) ||
					requestedSize < 2 ||
					requestedSize > 6
				) {
					requestedSize = 3;
				}

				if (!roomSettings.has(topic)) {
					roomSettings.set(topic, {
						hostId: isHost ? userId : null,
						targetSize: requestedSize,
					});
				} else if (isHost) {
					const s = roomSettings.get(topic)!;
					if (p.size) {
						s.targetSize = requestedSize;
					}
					if (!s.hostId) {
						s.hostId = userId;
					}
				}

				const currentSettings = roomSettings.get(topic)!;
				const maxCapacity = currentSettings.targetSize;

				// Collect occupied seats from other users currently in this room
				const occupiedSeats = new Set<number>();
				for (const [uid, metas] of roomMap.entries()) {
					if (
						uid !== userId &&
						metas[0] &&
						typeof metas[0].seat === "number" &&
						metas[0].seat >= 0
					) {
						occupiedSeats.add(metas[0].seat);
					}
				}

				// Determine unique seat
				let assignedSeat = -1;
				if (
					isHost ||
					userId === currentSettings.hostId ||
					(!occupiedSeats.has(0) && roomMap.size === 0)
				) {
					assignedSeat = 0;
				} else {
					// If the client previously had a seat, keep it
					const existingMeta = roomMap.get(userId)?.[0];
					if (
						existingMeta &&
						typeof existingMeta.seat === "number" &&
						existingMeta.seat > 0 &&
						existingMeta.seat < maxCapacity &&
						!occupiedSeats.has(existingMeta.seat)
					) {
						assignedSeat = existingMeta.seat;
					} else if (
						typeof p.seat === "number" &&
						p.seat > 0 &&
						p.seat < maxCapacity &&
						!occupiedSeats.has(p.seat)
					) {
						assignedSeat = p.seat;
					} else {
						// Find lowest available seat from 1 to maxCapacity - 1
						for (let slot = 1; slot < maxCapacity; slot++) {
							if (!occupiedSeats.has(slot)) {
								assignedSeat = slot;
								break;
							}
						}
					}
				}

				// Fallback slot if room was crowded
				if (assignedSeat < 0) {
					for (let slot = 0; slot < 6; slot++) {
						if (!occupiedSeats.has(slot)) {
							assignedSeat = slot;
							break;
						}
					}
				}

				const meta: PresenceMeta = {
					at: Number(p.at || Date.now()),
					id: userId,
					name: String(p.name || "friend"),
					pen: String(p.pen || "reynolds045"),
					phx_ref: ws.data.id + "_" + Date.now(),
					seat: assignedSeat,
					targetSize: maxCapacity,
				};

				ws.data.presence.set(topic, meta);
				roomMap.set(userId, [meta]);

				// Send full presence_state to joining client
				const statePayload: Record<string, { metas: PresenceMeta[] }> = {};
				for (const [uid, metas] of roomMap.entries()) {
					statePayload[uid] = { metas };
				}
				ws.send(
					JSON.stringify({
						event: "presence_state",
						payload: statePayload,
						ref: null,
						topic,
					})
				);

				// Broadcast presence_diff (join) with the unique assigned seat to all other clients
				const diffMsg = JSON.stringify({
					event: "presence_diff",
					payload: {
						joins: { [userId]: { metas: [meta] } },
						leaves: {},
					},
					ref: null,
					topic,
				});

				// Broadcast room_info update
				const roomInfoMsg = JSON.stringify({
					event: "broadcast",
					payload: {
						event: "room_info",
						payload: {
							hostId: currentSettings.hostId,
							targetSize: maxCapacity,
						},
					},
					ref: null,
					topic,
				});

				const roomClients = clientsByTopic.get(topic);
				if (roomClients) {
					for (const client of roomClients) {
						if (client.readyState === 1) {
							if (client !== ws) {
								client.send(diffMsg);
							}
							client.send(roomInfoMsg);
						}
					}
				}
				return;
			}

			// 4. Broadcast events (turn, shot, pass, sync, pen_change, player_ready, match_start, etc.)
			if (event === "broadcast" && payload?.type === "broadcast") {
				const broadcastMsg = JSON.stringify({
					event: "broadcast",
					payload: {
						event: payload.event,
						payload: payload.payload,
					},
					ref: null,
					topic,
				});

				const roomClients = clientsByTopic.get(topic);
				if (roomClients) {
					for (const client of roomClients) {
						if (client !== ws && client.readyState === 1) {
							client.send(broadcastMsg);
						}
					}
				}
			}
		},
		open(_ws: ServerWebSocket<SocketData>) {
			// client connected
		},
	},
});

console.log(`[PenFight Realtime Server] Listening on http://localhost:${PORT}`);
