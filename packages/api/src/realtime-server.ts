// Self-hosted Realtime WebSocket Server for Pen Fight (Phoenix Channel v1.0.0 protocol compatible)
import type { ServerWebSocket } from "bun";

interface PresenceMeta {
  phx_ref: string;
  id: string;
  name: string;
  seat: number;
  pen: string;
  at: number;
  [key: string]: unknown;
}

interface SocketData {
  id: string;
  roomTopics: Set<string>;
  presence: Map<string, PresenceMeta>; // topic -> meta
}

const rooms = new Map<string, Map<string, PresenceMeta[]>>(); // topic -> (userId -> metas)
const clientsByTopic = new Map<string, Set<ServerWebSocket<SocketData>>>();

const PORT = 3002;

Bun.serve<SocketData>({
  port: PORT,
  fetch(req: Request, server: any): Response | undefined {
    const url = new URL(req.url);
    if (url.pathname === "/realtime/v1/websocket" || url.pathname === "/realtime" || url.pathname === "/") {
      const upgraded = server.upgrade(req, {
        data: {
          id: "conn_" + Math.random().toString(36).slice(2, 9),
          roomTopics: new Set<string>(),
          presence: new Map<string, PresenceMeta>()
        }
      });
      if (upgraded) return undefined;
    }
    return new Response("Pen Fight Realtime WebSocket Server Running!", { status: 200 });
  },
  websocket: {
    open(_ws: ServerWebSocket<SocketData>) {
      // client connected
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
        ws.send(JSON.stringify({
          topic: "phoenix",
          event: "phx_reply",
          payload: { status: "ok", response: {} },
          ref
        }));
        return;
      }

      // 2. Channel Join
      if (event === "phx_join") {
        ws.data.roomTopics.add(topic);
        if (!clientsByTopic.has(topic)) {
          clientsByTopic.set(topic, new Set());
        }
        clientsByTopic.get(topic)!.add(ws);

        // Acknowledge join
        ws.send(JSON.stringify({
          topic,
          event: "phx_reply",
          payload: { status: "ok", response: {} },
          ref
        }));

        // Send current presence state if any
        const roomPresences = rooms.get(topic);
        if (roomPresences && roomPresences.size > 0) {
          const statePayload: Record<string, { metas: PresenceMeta[] }> = {};
          for (const [userId, metas] of roomPresences.entries()) {
            statePayload[userId] = { metas };
          }
          ws.send(JSON.stringify({
            topic,
            event: "presence_state",
            payload: statePayload,
            ref: null
          }));
        }
        return;
      }

      // 3. Presence Track
      if (event === "presence" && payload?.type === "presence" && payload?.event === "track") {
        const p = payload.payload;
        if (!p || !p.id) return;

        const userId = String(p.id);

        if (!rooms.has(topic)) {
          rooms.set(topic, new Map());
        }
        const roomMap = rooms.get(topic)!;

        // Collect occupied seats from other users currently in this room
        const occupiedSeats = new Set<number>();
        for (const [uid, metas] of roomMap.entries()) {
          if (uid !== userId && metas[0] && typeof metas[0].seat === "number" && metas[0].seat >= 0) {
            occupiedSeats.add(metas[0].seat);
          }
        }

        // Determine unique seat: 0 for host, or lowest available seat 1..5 for guests
        let assignedSeat = typeof p.seat === "number" && p.seat >= 0 && !occupiedSeats.has(p.seat) ? p.seat : -1;
        if (assignedSeat < 0) {
          for (let slot = 0; slot < 6; slot++) {
            if (!occupiedSeats.has(slot)) {
              assignedSeat = slot;
              break;
            }
          }
        }

        const meta: PresenceMeta = {
          phx_ref: ws.data.id + "_" + Date.now(),
          id: userId,
          name: String(p.name || "friend"),
          seat: assignedSeat,
          pen: String(p.pen || "reynolds045"),
          at: Number(p.at || Date.now())
        };

        ws.data.presence.set(topic, meta);
        roomMap.set(userId, [meta]);

        // Send full presence_state to joining client
        const statePayload: Record<string, { metas: PresenceMeta[] }> = {};
        for (const [uid, metas] of roomMap.entries()) {
          statePayload[uid] = { metas };
        }
        ws.send(JSON.stringify({
          topic,
          event: "presence_state",
          payload: statePayload,
          ref: null
        }));

        // Broadcast presence_diff (join) with the unique assigned seat to all other clients
        const diffMsg = JSON.stringify({
          topic,
          event: "presence_diff",
          payload: {
            joins: { [userId]: { metas: [meta] } },
            leaves: {}
          },
          ref: null
        });

        const roomClients = clientsByTopic.get(topic);
        if (roomClients) {
          for (const client of roomClients) {
            if (client !== ws && client.readyState === 1) {
              client.send(diffMsg);
            }
          }
        }
        return;
      }

      // 4. Broadcast events (turn, shot, pass, sync, etc.)
      if (event === "broadcast" && payload?.type === "broadcast") {
        const broadcastMsg = JSON.stringify({
          topic,
          event: "broadcast",
          payload: {
            event: payload.event,
            payload: payload.payload
          },
          ref: null
        });

        const roomClients = clientsByTopic.get(topic);
        if (roomClients) {
          for (const client of roomClients) {
            if (client !== ws && client.readyState === 1) {
              client.send(broadcastMsg);
            }
          }
        }
        return;
      }
    },
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
            }
          }

          // Broadcast presence_diff (leaves)
          const leaveMsg = JSON.stringify({
            topic,
            event: "presence_diff",
            payload: {
              joins: {},
              leaves: { [meta.id]: { metas: [meta] } }
            },
            ref: null
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
    }
  }
});

console.log(`[PenFight Realtime Server] Listening on http://localhost:${PORT}`);
