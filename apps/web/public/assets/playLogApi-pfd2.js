import { bY as s } from "./main-pfd2.js";
import "./index-pfd2.js";
function o(t, r) {
	return t === "9d" || t === "9e"
		? { kind: "school", payload: { ...r, room: t } }
		: t === "championship"
			? { kind: "school", payload: { ...r, room: "ninth" } }
			: { kind: t, payload: r };
}
async function u(t, r = !1) {
	const e = o(t.kind, t.payload),
		a =
			(await s(
				"log_play",
				{
					p_kind: e.kind,
					p_match_id: t.matchId,
					p_payload: e.payload,
					p_player_id: t.playerId,
				},
				{ keepalive: r, timeout: 1e4 }
			)) ?? {};
	return a.status === "saved"
		? { status: "saved" }
		: a.status === "duplicate"
			? { status: "duplicate" }
			: a.status === "retry_later"
				? { status: "retry_later" }
				: a.status === "rejected"
					? {
							reason: typeof a.reason == "string" ? a.reason.slice(0, 40) : "",
							status: "rejected",
						}
					: { status: "unbound" };
}
export { u as commitPlay };
