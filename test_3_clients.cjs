"use strict";
const WebSocket = require("ws");

const url = process.env.REALTIME_URL
	? process.env.REALTIME_URL.replace(/^http/, "ws") + "/realtime/v1/websocket?apikey=test&vsn=1.0.0"
	: "ws://localhost:3002/realtime/v1/websocket?apikey=test&vsn=1.0.0";
const topic = "realtime:room:testroom";

function createClient(name, seat, pen) {
	const ws = new WebSocket(url);
	const userId = "u_" + name.toLowerCase();
	const peers = new Map();

	return new Promise((resolve) => {
		ws.on("open", () => {
			// 1. Join topic
			ws.send(
				JSON.stringify({
					event: "phx_join",
					payload: {
						config: {
							broadcast: { ack: false, self: false },
							presence: { key: "" },
						},
					},
					ref: "1",
					topic,
				})
			);
		});

		ws.on("message", (data) => {
			const msg = JSON.parse(data.toString());
			console.log(`[${name}] recv:`, msg.event, JSON.stringify(msg.payload));

			if (msg.event === "phx_reply" && msg.ref === "1") {
				// Track presence
				ws.send(
					JSON.stringify({
						event: "presence",
						payload: {
							event: "track",
							payload: { at: Date.now(), id: userId, name, pen, seat },
							type: "presence",
						},
						ref: "2",
						topic,
					})
				);
			}

			if (msg.event === "presence_state") {
				peers.clear();
				for (const [p, v] of Object.entries(msg.payload || {})) {
					peers.set(p, v.metas || []);
				}
				logPeers(name, userId, peers);
			}

			if (msg.event === "presence_diff") {
				for (const [v, p] of Object.entries(msg.payload.leaves || {})) {
					peers.delete(v);
				}
				for (const [v, p] of Object.entries(msg.payload.joins || {})) {
					const m = peers.get(v) || [];
					peers.set(v, m.concat(p.metas || []));
				}
				logPeers(name, userId, peers);
			}
		});

		setTimeout(() => resolve(ws), 500);
	});
}

function logPeers(clientName, myId, peers) {
	const otherPeers = [];
	for (const [id, metas] of peers.entries()) {
		if (id !== myId && metas[0]) {
			otherPeers.push({ id, name: metas[0].name, seat: metas[0].seat });
		}
	}
	console.log(
		`===> [${clientName}] peer list length: ${otherPeers.length}:`,
		otherPeers
	);
}

async function run() {
	console.log("--- Connecting Player 1 (Host) ---");
	const ws1 = await createClient("Host", 0, "cello_gripper");

	await new Promise((r) => setTimeout(r, 600));

	console.log("--- Connecting Player 2 (Guest 1) ---");
	const ws2 = await createClient("Player2", 1, "cello_gripper");

	await new Promise((r) => setTimeout(r, 600));

	console.log("--- Connecting Player 3 (Guest 2) ---");
	const ws3 = await createClient("Player3", 1, "cello_gripper");

	await new Promise((r) => setTimeout(r, 1000));

	ws1.close();
	ws2.close();
	ws3.close();
}

run().catch(console.error);
