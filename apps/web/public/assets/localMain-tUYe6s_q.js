var rn = Object.defineProperty;
var ln = (o, e, t) =>
	e in o
		? rn(o, e, { configurable: !0, enumerable: !0, value: t, writable: !0 })
		: (o[e] = t);
var G = (o, e, t) => ln(o, typeof e == "symbol" ? e : e + "", t);
import {
	U as _n,
	E as $n,
	F as An,
	d as Be,
	C as bn,
	B as Cn,
	i as cn,
	Y as Dn,
	b as de,
	k as dn,
	x as En,
	Q as Fn,
	S as fn,
	a as Gt,
	H as gn,
	s as H,
	X as Hn,
	V as he,
	q as hn,
	N as In,
	g as Je,
	l as jt,
	D as kn,
	t as Le,
	J as Ln,
	f as Lt,
	K as Mn,
	P as Mt,
	m as mn,
	v as Ne,
	I as Nn,
	r as Nt,
	W as On,
	T as oe,
	G as Pn,
	o as pn,
	e as qt,
	M as Rn,
	L as Rt,
	z as Sn,
	n as st,
	O as Tn,
	c as un,
	A as vn,
	w as wn,
	h as X,
	p as Xe,
	y as xn,
	u as yn,
	j as Ze,
	R as zn,
} from "./main-NZF1ugMT.js";
import "./index-DyrlfgZ-.js";
function It(o) {
	return {
		...o,
		outs: [...o.outs],
		roundWinners: [...o.roundWinners],
		scores: [...o.scores],
	};
}
class et {
	constructor(e, t, a = {}, s) {
		G(this, "value");
		if (s) {
			this.value = It(s);
		} else {
			const u = st(a.openerSeed ?? 0, t),
				l = st(a.layoutSeed ?? 0, t),
				m = Math.max(0, Math.floor(a.fairnessCursor ?? 0)),
				f = Nt(t, u, l, m);
			this.value = {
				activeSeat: f.opener,
				fairnessCursor: m,
				layoutRotation: f.layoutRotation,
				layoutSeed: l,
				matchId: e,
				opener: f.opener,
				openerSeed: u,
				outs: [],
				phase: "aiming",
				revision: 0,
				round: 1,
				roundWinners: [],
				scores: H(t).map(() => 0),
				size: t,
				targetWins: Le(t),
				turn: 1,
				version: 1,
				winner: null,
			};
		}
		this.assertValid();
	}
	state() {
		return It(this.value);
	}
	canShoot(e) {
		return (
			this.value.phase === "aiming" &&
			this.value.activeSeat === e &&
			!this.value.outs.includes(e)
		);
	}
	beginShot(e, t) {
		return !this.canShoot(e) || t !== this.value.turn
			? !1
			: ((this.value.phase = "settling"), this.value.revision++, !0);
	}
	resumeInterruptedShot() {
		return this.value.phase !== "settling" || this.value.activeSeat === null
			? !1
			: ((this.value.phase = "aiming"), this.value.revision++, !0);
	}
	settle(e, t) {
		return this.value.phase !== "settling" ||
			e !== this.value.turn ||
			this.value.activeSeat === null
			? { kind: "continue", state: this.state(), winner: null }
			: this.resolveOuts(t, !0);
	}
	recordLateOuts(e) {
		if (this.value.phase !== "aiming" || this.value.activeSeat === null) {
			return null;
		}
		const t = new Set(H(this.value.size)),
			a = e.filter((s) => t.has(s) && !this.value.outs.includes(s));
		return a.length === 0 ? null : this.resolveOuts(a, !1);
	}
	resolveOuts(e, t) {
		const a = new Set(H(this.value.size)),
			s = new Set(this.value.outs);
		for (const m of e) {
			a.has(m) && s.add(m);
		}
		(this.value.outs = H(this.value.size).filter((m) => s.has(m))),
			this.value.revision++;
		const u = H(this.value.size).filter((m) => !s.has(m));
		if (u.length >= 2) {
			const m = s.has(this.value.activeSeat);
			return (
				(t || m) &&
					(this.value.turn++,
					(this.value.activeSeat = Gt(
						this.value.activeSeat,
						this.value.size,
						s
					))),
				(this.value.phase = "aiming"),
				{ kind: "continue", state: this.state(), winner: null }
			);
		}
		const l = u.length === 1 ? u[0] : null;
		return (
			this.value.roundWinners.push(l),
			(this.value.activeSeat = null),
			l !== null && this.value.scores[l]++,
			l !== null && this.value.scores[l] >= this.value.targetWins
				? ((this.value.winner = l),
					(this.value.phase = "match_end"),
					{ kind: "match_won", state: this.state(), winner: l })
				: ((this.value.phase = "round_result"),
					{
						kind: l === null ? "round_tied" : "round_won",
						state: this.state(),
						winner: l,
					})
		);
	}
	nextRound() {
		if (this.value.phase !== "round_result") {
			return !1;
		}
		this.value.round++, this.value.turn++, this.value.fairnessCursor++;
		const e = Nt(
			this.value.size,
			this.value.openerSeed,
			this.value.layoutSeed,
			this.value.fairnessCursor
		);
		return (
			(this.value.layoutRotation = e.layoutRotation),
			(this.value.opener = e.opener),
			(this.value.activeSeat = e.opener),
			(this.value.outs = []),
			(this.value.phase = "aiming"),
			this.value.revision++,
			!0
		);
	}
	restartRound() {
		return this.value.phase === "match_end"
			? !1
			: (this.value.turn++,
				(this.value.activeSeat = this.value.opener),
				(this.value.outs = []),
				(this.value.phase = "aiming"),
				this.value.revision++,
				!0);
	}
	assertValid() {
		const e = this.value;
		if (e.version !== 1 || !cn(e.size)) {
			throw new Error("invalid local party state");
		}
		const t = H(e.size);
		if (e.targetWins !== Le(e.size) || e.scores.length !== e.size) {
			throw new Error("invalid local party score");
		}
		if (e.scores.some((a) => !Number.isInteger(a) || a < 0)) {
			throw new Error("invalid local party score");
		}
		if (
			!(
				t.includes(e.opener) &&
				t.includes(e.openerSeed) &&
				t.includes(e.layoutSeed) &&
				t.includes(e.layoutRotation)
			)
		) {
			throw new Error("invalid local party seat");
		}
		if (
			e.outs.some((a) => !t.includes(a)) ||
			new Set(e.outs).size !== e.outs.length
		) {
			throw new Error("invalid local party outs");
		}
		if (e.phase === "aiming" && e.activeSeat === null) {
			throw new Error("aiming without an active seat");
		}
		if (
			e.activeSeat !== null &&
			(!t.includes(e.activeSeat) || e.outs.includes(e.activeSeat))
		) {
			throw new Error("invalid active seat");
		}
		if (e.phase === "match_end" && e.winner === null) {
			throw new Error("match end without winner");
		}
	}
}
const tt = (o) => `${o} ${o === 1 ? "win" : "wins"}`;
function Wn(o, e) {
	let t = 0;
	for (let a = o.length - 1; a >= 0 && o[a].winner === e; a--) {
		t++;
	}
	return t;
}
function Bn(o) {
	if (!o.roundWinners.length) {
		return !1;
	}
	const e = o.scores.map(() => 0);
	let t = !1;
	for (const a of o.roundWinners) {
		a !== null && e[a]++;
		const s = Math.max(...e.filter((u, l) => l !== o.winner));
		e[o.winner] < s && (t = !0);
	}
	return t;
}
function We(o, e, t) {
	const a = t.at(-1);
	if (!a) {
		return {
			detail: "The series starts here.",
			kind: "win",
			label: "GAME WON",
			streak: 0,
		};
	}
	const s = o[a.winner],
		u = (s == null ? void 0 : s.name) ?? `Player ${a.winner + 1}`,
		l = Wn(t, a.winner),
		m = e.reduce((y, d) => y + d, 0),
		f = e[a.winner] ?? 0,
		w = Math.max(0, ...e.filter((y, d) => d !== a.winner)),
		C = Math.max(0, ...e),
		k = o.filter((y) => (e[y.seat] ?? 0) === C),
		E =
			a.roundWinners.length > 0 && a.roundWinners.every((y) => y === a.winner),
		x = Math.max(0, ...a.scores.filter((y, d) => d !== a.winner));
	return l >= 3
		? {
				detail: `${u} has won the last ${l} games.`,
				kind: "streak",
				label: `${l} IN A ROW`,
				streak: l,
			}
		: Bn(a)
			? {
					detail: `${u} came from behind to take Game ${m}.`,
					kind: "comeback",
					label: "COMEBACK WIN",
					streak: l,
				}
			: l === 2
				? {
						detail: `${u} has won two games in a row.`,
						kind: "streak",
						label: "BACK-TO-BACK",
						streak: l,
					}
				: E
					? {
							detail: `${u} won every round.`,
							kind: "sweep",
							label: "CLEAN SWEEP",
							streak: l,
						}
					: m === 1
						? {
								detail: `${u} opens the series.`,
								kind: "first",
								label: "FIRST WIN",
								streak: l,
							}
						: k.length > 1 && k.some((y) => y.seat === a.winner)
							? {
									detail: `${k.map((d) => d.name).join(" · ")} share the lead with ${tt(C)}.`,
									kind: "tie",
									label: "SERIES TIED",
									streak: l,
								}
							: f > w && f - 1 <= w
								? {
										detail: `${u} now leads the series with ${tt(f)}.`,
										kind: "lead",
										label: "TAKES THE LEAD",
										streak: l,
									}
								: x === (a.scores[a.winner] ?? 0) - 1
									? {
											detail: `${u} closed out the deciding round.`,
											kind: "close",
											label: "DOWN TO THE WIRE",
											streak: l,
										}
									: {
											detail: `${u} moves to ${tt(f)} in the series.`,
											kind: "win",
											label: `GAME ${m}`,
											streak: l,
										};
}
const Tt = [
	{ css: "#24262b", label: "black", three: 2_369_067 },
	{ css: "#2458b8", label: "blue", three: 2_382_008 },
	{ css: "#237552", label: "green", three: 2_323_794 },
	{ css: "#b64032", label: "red", three: 11_943_986 },
	{ css: "#75439a", label: "violet", three: 7_685_018 },
	{ css: "#bd6b24", label: "orange", three: 12_413_732 },
];
function K(o) {
	return Tt[o] ?? Tt[0];
}
const Yn = {
	2: [
		{ x: 0, yaw: 0, z: 0.196 },
		{ x: 0, yaw: 0, z: -0.196 },
	],
	3: [
		{ x: 0, yaw: 0, z: 0.24 },
		{ x: -0.14, yaw: Math.PI / 3, z: -0.16 },
		{ x: 0.14, yaw: -Math.PI / 3, z: -0.16 },
	],
	4: [
		{ x: -0.25, yaw: Math.PI / 5, z: 0.19 },
		{ x: 0.25, yaw: -Math.PI / 5, z: 0.19 },
		{ x: 0.25, yaw: Math.PI / 5, z: -0.19 },
		{ x: -0.25, yaw: -Math.PI / 5, z: -0.19 },
	],
	5: [
		{ x: -0.11, yaw: 0, z: 0.24 },
		{ x: 0.29, yaw: -Math.PI / 2.8, z: 0.09 },
		{ x: 0.22, yaw: Math.PI / 5, z: -0.21 },
		{ x: -0.22, yaw: -Math.PI / 5, z: -0.21 },
		{ x: -0.29, yaw: Math.PI / 2.8, z: 0.09 },
	],
	6: [
		{ x: -0.18, yaw: Math.PI / 8, z: 0.22 },
		{ x: 0.18, yaw: -Math.PI / 8, z: 0.22 },
		{ x: 0.32, yaw: -Math.PI / 2, z: 0 },
		{ x: 0.18, yaw: Math.PI / 8, z: -0.22 },
		{ x: -0.18, yaw: -Math.PI / 8, z: -0.22 },
		{ x: -0.32, yaw: Math.PI / 2, z: 0 },
	],
};
function Gn(o) {
	return o > 3
		? { depth: 0.7, joined: !0, width: 0.92 }
		: { depth: 0.7, joined: !1, width: 0.46 };
}
function Ft(o, e, t) {
	return Yn[o][st(t + e, o)];
}
const ot = "pf_local_party_fullscreen";
function Me() {
	var o;
	return (
		navigator.maxTouchPoints > 0 ||
		((o = window.matchMedia) == null
			? void 0
			: o.call(window, "(pointer: coarse)").matches)
	);
}
function Ee() {
	var o;
	return (
		!!document.fullscreenElement ||
		!!document.webkitFullscreenElement ||
		navigator.standalone === !0 ||
		((o = window.matchMedia) == null
			? void 0
			: o.call(window, "(display-mode: fullscreen), (display-mode: standalone)")
					.matches)
	);
}
function jn() {
	if (!Me()) {
		return !1;
	}
	const o = document.documentElement;
	return (
		typeof o.requestFullscreen == "function" ||
		typeof o.webkitRequestFullscreen == "function"
	);
}
function qn() {
	return Me() && !Ee();
}
function Ut() {
	if (Me()) {
		try {
			sessionStorage.setItem(ot, "1");
		} catch {}
	}
}
function Un() {
	try {
		sessionStorage.removeItem(ot);
	} catch {}
}
function zt() {
	if (!Me()) {
		return !1;
	}
	try {
		return sessionStorage.getItem(ot) === "1";
	} catch {
		return !1;
	}
}
async function rt() {
	var e;
	if (!Me()) {
		return !1;
	}
	if ((Ut(), Ee())) {
		return !0;
	}
	const o = document.documentElement;
	if (!(o.requestFullscreen || o.webkitRequestFullscreen)) {
		return !1;
	}
	try {
		return (
			o.requestFullscreen
				? await o.requestFullscreen({ navigationUI: "hide" })
				: await ((e = o.webkitRequestFullscreen) == null ? void 0 : e.call(o)),
			Ee()
		);
	} catch {
		return !1;
	}
}
function Kn() {
	if (!zt() || Ee()) {
		return;
	}
	const o = () => {
		!zt() || Ee() || rt();
	};
	document.addEventListener("pointerdown", o, { capture: !0, once: !0 });
}
function Vn(o, e, t) {
	return o >= 4 && t > e;
}
async function _t() {
	await rt();
	const o = window.screen.orientation;
	if (!(o != null && o.lock)) {
		return !1;
	}
	try {
		return await o.lock("landscape"), !0;
	} catch {
		return !1;
	}
}
function Qn(o, e) {
	const t = (o.ax + o.bx) / 2,
		a = e.margin ?? 12,
		s = 9,
		u = a + e.cueHalfWidth,
		l = e.width - a - e.cueHalfWidth;
	if (u > l) {
		return null;
	}
	const m = Math.max(a, Math.min(e.width - a, t)),
		f = Math.max(u, Math.min(l, t)),
		w = Math.max(4, o.bodyPx / 2),
		C = Math.min(o.ay, o.by) - w,
		k = C - s - e.cueHalfHeight;
	if (k - e.cueHalfHeight >= a) {
		return { anchorX: m, anchorY: C, placement: "above", x: f, y: k };
	}
	const E = Math.max(o.ay, o.by) + w,
		x = E + s + e.cueHalfHeight;
	return x + e.cueHalfHeight > e.height - a
		? null
		: { anchorX: m, anchorY: E, placement: "below", x: f, y: x };
}
function Xn(o, e, t, a = Ne()) {
	if (t === 2) {
		Lt(o, e, { vp: a });
		return;
	}
	if (t === 3) {
		Lt(o, e, { nearControlGutterPx: 48, vp: a });
		return;
	}
	const { w: s, h: u } = a;
	o.clearViewOffset(), (o.aspect = s / u), (o.fov = u < 560 ? 47 : 50);
	const l = new he(0, 0, -0.08),
		m = new he(0, 0.66, 0.82).sub(l),
		f = [
			new he(-e.desk.width / 2, 0, -e.desk.depth / 2),
			new he(e.desk.width / 2, 0, -e.desk.depth / 2),
			new he(-e.desk.width / 2, 0, e.desk.depth / 2),
			new he(e.desk.width / 2, 0, e.desk.depth / 2),
		],
		w = (E) => {
			o.position.copy(l).addScaledVector(m, E),
				o.lookAt(l),
				o.updateProjectionMatrix(),
				o.updateMatrixWorld(!0);
			const x = f.map((b) => b.clone().project(o)),
				y = Math.min(...x.map((b) => ((b.x + 1) / 2) * s)),
				d = Math.max(...x.map((b) => ((b.x + 1) / 2) * s)),
				i = Math.min(...x.map((b) => ((1 - b.y) / 2) * u)),
				P = Math.max(...x.map((b) => ((1 - b.y) / 2) * u)),
				$ = Math.max(30, Math.min(58, s * 0.055)),
				N = Math.max(70, u * 0.13),
				S = Math.max(48, u * 0.09);
			return y >= $ && d <= s - $ && i >= N && P <= u - S;
		};
	let C = 0.72,
		k = 2.2;
	for (let E = 0; E < 18; E++) {
		const x = (C + k) / 2;
		w(x) ? (k = x) : (C = x);
	}
	w(k);
}
class Jn {
	constructor() {
		G(this, "shade", document.createElement("div"));
		G(this, "card", document.createElement("section"));
		G(this, "status", document.createElement("p"));
		G(this, "tryButton", document.createElement("button"));
		G(this, "backButton", document.createElement("button"));
		G(this, "previousFocus", null);
		(this.shade.className = "localpartyorientationshade"),
			this.shade.setAttribute("inert", ""),
			this.shade.setAttribute("aria-hidden", "true"),
			(this.card.className = "localpartyorientationcard"),
			this.card.setAttribute("role", "dialog"),
			this.card.setAttribute("aria-modal", "true"),
			this.card.setAttribute(
				"aria-labelledby",
				"local-party-orientation-title"
			);
		const e = document.createElement("p");
		(e.className = "localpartykicker"), (e.textContent = "LANDSCAPE REQUIRED");
		const t = document.createElement("span");
		(t.className = "localpartyorientationphone"),
			t.setAttribute("aria-hidden", "true");
		const a = document.createElement("h1");
		(a.id = "local-party-orientation-title"),
			(a.textContent = "Rotate your screen");
		const s = document.createElement("p");
		(s.className = "localpartycopy"),
			(s.textContent =
				"4–6 players need the full width to keep every edge playable."),
			(this.status.className = "localpartyorientationstatus"),
			this.status.setAttribute("role", "status"),
			this.status.setAttribute("aria-live", "polite");
		const u = document.createElement("div");
		(u.className = "localpartyactions"),
			(this.backButton.type = "button"),
			(this.backButton.className = "localpartysecondary"),
			(this.tryButton.type = "button"),
			(this.tryButton.className = "localpartyprimary"),
			(this.tryButton.textContent = "try landscape"),
			u.append(this.backButton, this.tryButton),
			this.card.append(e, t, a, s, this.status, u),
			this.shade.appendChild(this.card),
			document.body.appendChild(this.shade),
			this.card.addEventListener("keydown", (l) => {
				l.key === "Escape" && this.backButton.click(),
					l.key === "Tab" &&
						(l.shiftKey && document.activeElement === this.backButton
							? (l.preventDefault(), this.tryButton.focus())
							: !l.shiftKey &&
								document.activeElement === this.tryButton &&
								(l.preventDefault(), this.backButton.focus()));
			});
	}
	get open() {
		return this.shade.classList.contains("show");
	}
	show(e) {
		const t = !this.open;
		if (
			((this.backButton.textContent = e.backLabel),
			(this.backButton.onclick = e.onBack),
			(this.tryButton.onclick = async () => {
				(this.tryButton.disabled = !0),
					(this.status.textContent = "Trying to rotate…");
				const s = await e.onTry();
				(this.tryButton.disabled = !1),
					s ||
						(this.status.textContent =
							"Rotate the device sideways to continue.");
			}),
			!t)
		) {
			return;
		}
		this.previousFocus =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		const a = document.querySelector(".localpartyshade.show");
		a == null || a.setAttribute("inert", ""),
			a == null || a.setAttribute("aria-hidden", "true"),
			(this.status.textContent = ""),
			this.shade.removeAttribute("inert"),
			this.shade.removeAttribute("aria-hidden"),
			this.shade.classList.add("show"),
			window.setTimeout(() => this.tryButton.focus(), 20);
	}
	hide(e = !1) {
		var a;
		if (!this.open) {
			return;
		}
		this.shade.classList.remove("show"),
			this.shade.setAttribute("inert", ""),
			this.shade.setAttribute("aria-hidden", "true");
		const t = document.querySelector(".localpartyshade.show");
		t == null || t.removeAttribute("inert"),
			t == null || t.removeAttribute("aria-hidden"),
			e && ((a = this.previousFocus) == null || a.focus({ preventScroll: !0 })),
			(this.previousFocus = null);
	}
}
const De = (o) => `Player ${o + 1}`,
	I = (o, e, t) => {
		const a = document.createElement("button");
		return (
			(a.type = "button"),
			(a.className = e),
			(a.textContent = o),
			a.addEventListener("click", t),
			a
		);
	},
	Ot = (o) => jt(o).replaceAll(", ", " · ");
class Zn {
	constructor() {
		G(this, "shade", document.createElement("div"));
		G(this, "card", document.createElement("section"));
		G(this, "previousFocus", null);
		G(this, "escapeAction", null);
		G(this, "titleId", 0);
		G(this, "scrollObserver", null);
		G(this, "scrollFrame", 0);
		(this.shade.className = "localpartyshade"),
			this.shade.setAttribute("inert", ""),
			this.shade.setAttribute("aria-hidden", "true"),
			(this.card.className = "localpartycard"),
			this.card.setAttribute("role", "dialog"),
			this.card.setAttribute("aria-modal", "true"),
			(this.card.tabIndex = -1),
			this.shade.appendChild(this.card),
			document.body.appendChild(this.shade),
			this.shade.addEventListener("keydown", (e) => this.onKeyDown(e));
	}
	get open() {
		return this.shade.classList.contains("show");
	}
	close(e = !1) {
		var t;
		this.open &&
			(this.shade.classList.remove("show"),
			this.shade.setAttribute("inert", ""),
			this.shade.setAttribute("aria-hidden", "true"),
			document.body.classList.remove("local-party-sheet-open"),
			this.stopScrollTracking(),
			e && ((t = this.previousFocus) == null || t.focus({ preventScroll: !0 })),
			(this.previousFocus = null),
			(this.escapeAction = null));
	}
	countPicker(e, t, a, s) {
		const u = (e == null ? void 0 : e.state.phase) === "match_end";
		if (
			(this.begin(
				Mt.local.title.toUpperCase(),
				e
					? u
						? "Continue your series?"
						: "Continue your game?"
					: "How many players?"
			),
			e)
		) {
			const f = document.createElement("p");
			f.className = "localpartycopy";
			const w = e.sessionWins.reduce((E, x) => E + x, 0);
			(f.textContent = u
				? `${e.state.size} players · ${w} ${w === 1 ? "game" : "games"} played`
				: `${e.state.size} players · round ${e.state.round}${w ? ` · series ${e.sessionWins.join("–")}` : ""}`),
				this.card.appendChild(f);
			const C = document.createElement("ol");
			C.className = "localpartyresumeroster";
			for (const E of e.participants) {
				const x = document.createElement("li");
				x.style.setProperty("--party-colour", K(E.seat).css);
				const y = document.createElement("i");
				y.setAttribute("aria-hidden", "true");
				const d = document.createElement("span");
				d.textContent = E.name;
				const i = document.createElement("strong");
				(i.textContent = String(
					(u ? e.sessionWins : e.state.scores)[E.seat] ?? 0
				)),
					x.append(y, d, i),
					C.appendChild(x);
			}
			this.card.appendChild(C);
			const k = document.createElement("div");
			(k.className = "localpartyactions stacked"),
				k.append(
					I(u ? "view results" : "continue", "localpartyprimary", a),
					I("new game", "localpartysecondary", () =>
						this.countPicker(null, t, a, s)
					),
					I("back", "localpartytextbutton", s)
				),
				this.card.appendChild(k),
				this.show(s);
			return;
		}
		const l = document.createElement("div");
		l.className = "localpartycountgrid";
		for (const f of [2, 3, 4, 5, 6]) {
			const w = I("", "localpartycount", () => t(f)),
				C = document.createElement("strong");
			C.textContent = String(f);
			const k = document.createElement("span");
			k.textContent = "players";
			const E = f > 3;
			w.setAttribute(
				"aria-label",
				`${f} players, ${E ? "two joined desks" : "one desk"}, first to ${Le(f)}`
			);
			const x = document.createElement("small");
			(x.textContent = `first to ${Le(f)}`),
				w.append(C, k, x),
				l.appendChild(w);
		}
		const m = document.createElement("p");
		(m.className = "localpartyorientationnote"),
			(m.textContent = "4–6 players use two joined desks and need landscape."),
			this.card.append(
				l,
				m,
				I("back", "localpartytextbutton localpartyback", s)
			),
			this.show(s);
	}
	setup(e, t, a, s, u, l = null) {
		var d;
		this.begin(Mt.local.title.toUpperCase(), `${e} players`);
		const m = document.createElement("p");
		(m.className = "localpartymetas"),
			(m.textContent = `${e > 3 ? "Two joined desks" : "One desk"} · First to ${Le(e)} rounds${e >= 4 ? " · Landscape" : ""}`);
		const f = document.createElement("form");
		f.className = "localpartyform";
		const w = [],
			C = H(e).map((i) => {
				var P;
				return ((P = t[i]) == null ? void 0 : P.pen) ?? Be(i);
			}),
			k = () =>
				H(e).map((i) => {
					var P, $;
					return {
						name:
							((P = w[i]) == null ? void 0 : P.value) ??
							(($ = t[i]) == null ? void 0 : $.name) ??
							"",
						pen: C[i],
						seat: i,
					};
				});
		for (const i of H(e)) {
			const P = K(i),
				$ = document.createElement("div");
			($.className = "localpartyplayerrow"),
				$.style.setProperty("--party-colour", P.css);
			const N = document.createElement("i");
			(N.className = "localpartyplayerdot"),
				N.setAttribute("aria-hidden", "true");
			const S = document.createElement("label");
			S.className = "localpartynamefield";
			const b = document.createElement("span");
			(b.className = "sr-only"), (b.textContent = `Player ${i + 1} name`);
			const R = document.createElement("input");
			(R.name = `player-${i + 1}`),
				(R.maxLength = 16),
				(R.autocomplete = "off"),
				(R.enterKeyHint = i === e - 1 ? "done" : "next");
			const D = ((d = t[i]) == null ? void 0 : d.name) ?? "";
			(R.value = D === De(i) ? "" : D),
				(R.placeholder = De(i)),
				R.setAttribute("aria-label", `Player ${i + 1} name`);
			let W = !0;
			R.addEventListener("focus", () => {
				W && ((W = !1), R.value && requestAnimationFrame(() => R.select()));
			}),
				R.addEventListener("keydown", (M) => {
					if (M.key !== "Enter") {
						return;
					}
					M.preventDefault();
					const O = w[i + 1];
					O ? (O.focus(), O.select()) : R.blur();
				}),
				S.append(b, R);
			const F = document.createElement("button");
			(F.type = "button"),
				(F.className = "localpartypenbutton"),
				(F.dataset.penSeat = String(i));
			const A = de[C[i]];
			F.setAttribute(
				"aria-label",
				`Choose player ${i + 1} pen. Currently ${A.name}`
			);
			const _ = document.createElement("img");
			(_.src = Xe(A.id)),
				(_.alt = ""),
				(_.width = 67),
				(_.height = 31),
				(_.draggable = !1);
			const B = document.createElement("span"),
				c = document.createElement("strong");
			(c.textContent = A.short),
				B.append(c),
				F.append(_, B),
				F.addEventListener("click", () =>
					this.penPicker(
						e,
						i,
						k(),
						(M) => {
							const O = k();
							(O[i].pen = M), this.setup(e, O, a, s, u, i);
						},
						() => this.setup(e, k(), a, s, u, i)
					)
				),
				$.append(N, S, F),
				f.appendChild($),
				w.push(R);
		}
		const E = document.createElement("div");
		(E.className = "localpartysetuptools"),
			E.append(
				I("shuffle pens", "localpartytextbutton", () => {
					const i = k(),
						P = [...Rt].sort(() => Math.random() - 0.5);
					i.forEach(($, N) => {
						$.pen = P[N % P.length];
					}),
						this.setup(e, i, a, s, u);
				})
			);
		const x = document.createElement("div");
		(x.className = "localpartyactions"),
			x.append(I("change number of players", "localpartysecondary", s));
		const y = document.createElement("button");
		(y.type = "button"),
			(y.className = "localpartyprimary"),
			(y.textContent = "start game"),
			x.appendChild(y),
			f.append(E, x),
			y.addEventListener("click", () => {
				a(k().map((i) => ({ ...i, name: un(i.name, De(i.seat)) })));
			}),
			f.addEventListener("submit", (i) => i.preventDefault()),
			this.card.append(
				m,
				f,
				I("back to home", "localpartytextbutton localpartyback", u)
			),
			this.show(u, l === null ? void 0 : `[data-pen-seat="${l}"]`);
	}
	pause(e, t, a) {
		const s = t.activeSeat === null ? null : t.participants[t.activeSeat];
		this.begin("GAME PAUSED", s ? `${s.name}’s turn` : `Round ${t.round}`);
		const u = document.createElement("p");
		(u.className = "localpartypausestatus"),
			(u.textContent = `Round ${t.round} · First to ${t.targetWins}`);
		const l = document.createElement("div");
		(l.className = "localpartypauseroster"),
			l.style.setProperty("--party-size", String(t.participants.length)),
			l.style.setProperty(
				"--party-columns",
				String(t.participants.length > 4 ? 3 : t.participants.length)
			),
			l.setAttribute(
				"aria-label",
				`Round score: ${t.participants.map((S) => `${S.name} ${t.scores[S.seat] ?? 0}`).join(", ")}`
			);
		for (const S of t.participants) {
			const b = document.createElement("div");
			(b.className = `localpartypauseplayer${S.seat === t.activeSeat ? " active" : ""}`),
				b.style.setProperty("--party-colour", K(S.seat).css),
				S.seat === t.activeSeat && b.setAttribute("aria-current", "true");
			const R = document.createElement("span"),
				D = document.createElement("i");
			D.setAttribute("aria-hidden", "true");
			const W = document.createElement("span");
			W.textContent = S.name;
			const F = document.createElement("strong");
			(F.textContent = String(t.scores[S.seat] ?? 0)),
				R.append(D, W, F),
				b.append(R),
				l.appendChild(b);
		}
		const m = document.createElement("div");
		(m.className = "localpartymenu"),
			m.append(
				I("continue game", "localpartyprimary localpartycontinue", a.onResume)
			);
		const f = t.sessionWins.reduce((S, b) => S + b, 0),
			w = t.gameHistory.at(-1);
		if (f) {
			const S = w ? t.participants[w.winner] : null,
				b = w ? We(t.participants, t.sessionWins, t.gameHistory) : null,
				R = I("", "localpartyseriespeek", a.onSeries),
				D = document.createElement("span");
			D.className = "localpartyseriespeekhead";
			const W = document.createElement("small");
			W.textContent = `SERIES · ${f} ${f === 1 ? "GAME" : "GAMES"}`;
			const F = document.createElement("strong");
			(F.textContent = t.sessionWins.join("–")), D.append(W, F);
			const A = document.createElement("span");
			A.className = "localpartyserieslast";
			const _ = document.createElement("span"),
				B = document.createElement("strong");
			B.textContent =
				b && b.kind !== "win"
					? b.label
					: S
						? `${S.name} won game ${f}`
						: "Earlier game details unavailable";
			const c = document.createElement("small");
			(c.textContent =
				b && b.kind !== "win"
					? b.detail
					: w
						? `Rounds ${w.scores.join("–")}`
						: "Series score is still saved"),
				_.append(B, c);
			const M = document.createElement("em");
			(M.textContent = "history"),
				A.append(_, M),
				R.append(D, A),
				m.appendChild(R);
		}
		if (a.onRestart) {
			const S = document.createElement("div");
			(S.className = "localpartyroundactions"),
				S.append(I("restart round", "localpartytextaction", a.onRestart)),
				m.appendChild(S);
		}
		const C = I("", "localpartysettingsentry", () =>
				this.changeGame(
					t.participants,
					t.sessionWins,
					a.onPlayers,
					a.onCount,
					() => this.pause(e, t, a),
					"back to game menu"
				)
			),
			k = document.createElement("span"),
			E = document.createElement("strong");
		E.textContent = "Start a different game";
		const x = document.createElement("small");
		(x.textContent = "Change who’s playing or choose 2–6 players"),
			k.append(E, x);
		const y = document.createElement("b");
		(y.textContent = "›"),
			y.setAttribute("aria-hidden", "true"),
			C.append(k, y),
			m.appendChild(C);
		const d = document.createElement("div");
		d.className = "localpartymenuutilities";
		const i = I("", "localpartysound", a.onSound);
		i.setAttribute("aria-pressed", String(!e));
		const P = document.createElement("span");
		P.textContent = "Sound";
		const $ = document.createElement("strong");
		$.textContent = e ? "Off" : "On";
		const N = document.createElement("i");
		N.setAttribute("aria-hidden", "true"),
			i.append(P, $, N),
			d.append(i, I("save & exit", "localpartyexit", a.onExit)),
			m.appendChild(d),
			this.card.append(u, l, m),
			this.show(a.onResume);
	}
	changeGame(e, t, a, s, u, l) {
		const m = t.reduce((S, b) => S + b, 0);
		this.begin("NEW GAME", "What do you want to change?");
		const f = document.createElement("p");
		(f.className = "localpartysettingscontext"),
			(f.textContent = m
				? `Starting a different game ends this ${m}-game series.`
				: "Your current game will end.");
		const w = document.createElement("div");
		w.className = "localpartysettingschoices";
		const C = I("", "localpartysettingschoice", a),
			k = document.createElement("span"),
			E = document.createElement("strong");
		E.textContent = "Change who’s playing";
		const x = document.createElement("small");
		(x.textContent = `Keep ${e.length} players; edit names or choose different pens.`),
			k.append(E, x);
		const y = document.createElement("em");
		(y.textContent = "same group size"), C.append(k, y);
		const d = I("", "localpartysettingschoice", s),
			i = document.createElement("span"),
			P = document.createElement("strong");
		P.textContent = "Choose a different group size";
		const $ = document.createElement("small");
		($.textContent = "Start again with 2–6 players."), i.append(P, $);
		const N = document.createElement("em");
		(N.textContent = `currently ${e.length}`),
			d.append(i, N),
			w.append(C, d),
			this.card.append(f, w, I(l, "localpartysecondary localpartywide", u)),
			this.show(u);
	}
	confirm(e, t, a, s, u) {
		this.begin("CONFIRM", e);
		const l = document.createElement("p");
		(l.className = "localpartycopy"), (l.textContent = t);
		const m = document.createElement("div");
		(m.className = "localpartyactions"),
			m.append(
				I("cancel", "localpartysecondary", u),
				I(a, "localpartydanger", s)
			),
			this.card.append(l, m),
			this.show(u);
	}
	fullscreenHelp(e) {
		this.begin("MORE PLAY SPACE", "Play without browser bars");
		const t = document.createElement("p");
		(t.className = "localpartycopy"),
			(t.textContent =
				"Safari keeps its bars in a browser tab. Open Pen Fight from your Home Screen to remove them.");
		const a = document.createElement("ol");
		a.className = "localpartyfullscreensteps";
		for (const s of [
			"Tap Share in Safari.",
			"Choose Add to Home Screen.",
			"Open Pen Fight from the new icon.",
		]) {
			const u = document.createElement("li");
			(u.textContent = s), a.appendChild(u);
		}
		this.card.append(
			t,
			a,
			I("back to game", "localpartyprimary localpartywide", e)
		),
			this.show(e);
	}
	result(e, t, a, s, u, l, m, f, w, C, k = !0) {
		const E = s.reduce((c, M) => c + M, 0),
			x = We(t, s, u);
		this.begin(`GAME ${E}`, `${e.name} wins`),
			this.card.classList.add("localpartyresultcard"),
			k || this.card.classList.add("settled"),
			this.card.style.setProperty("--winner-colour", K(e.seat).css);
		const y = document.createElement("div");
		y.className = "localpartywinmoment";
		const d = document.createElement("img");
		(d.className = "localpartywinnerpen"),
			(d.src = Xe(e.pen)),
			(d.alt = `${de[e.pen].name}, ${e.name}'s winning pen`),
			(d.width = 330),
			(d.height = 90);
		const i = document.createElement("div");
		(i.className = "localpartywinstory"), (i.dataset.kind = x.kind);
		const P = document.createElement("strong");
		P.textContent = x.label;
		const $ = document.createElement("span");
		($.textContent = x.detail), i.append(P, $), y.append(d, i);
		const N = document.createElement("div");
		N.className = "localpartyresulttable";
		const S = document.createElement("div");
		(S.className = "localpartyresulthead"),
			S.append(document.createElement("span"));
		const b = document.createElement("span");
		b.textContent = "rounds";
		const R = document.createElement("span");
		(R.textContent = "games"), S.append(b, R), N.appendChild(S);
		for (const c of t) {
			const M = document.createElement("div");
			M.className = `localpartyresultrow${c.seat === e.seat ? " winner" : ""}`;
			const O = document.createElement("span");
			(O.className = "localpartyresultplayer"),
				O.style.setProperty("--party-colour", K(c.seat).css);
			const Y = document.createElement("i");
			Y.setAttribute("aria-hidden", "true");
			const xe = document.createElement("span");
			(xe.textContent = c.name), O.append(Y, xe);
			const re = document.createElement("strong");
			(re.textContent = String(a[c.seat] ?? 0)),
				(re.dataset.label = "rounds"),
				re.setAttribute("aria-label", `${re.textContent} rounds won`);
			const q = document.createElement("strong");
			(q.textContent = String(s[c.seat] ?? 0)),
				(q.dataset.label = "games"),
				q.setAttribute("aria-label", `${q.textContent} games won`),
				M.append(O, re, q),
				N.appendChild(M);
		}
		const D = document.createElement("div");
		D.className = "localpartyactions stacked";
		const W = I(
				`${E} ${E === 1 ? "game" : "games"} in this series · view history`,
				"localpartyserieslink",
				m
			),
			F = I("", "localpartyprimary localpartyrematch", l),
			A = document.createElement("strong");
		A.textContent = "play again";
		const _ = document.createElement("small");
		(_.textContent = `same ${t.length} players · same pens`), F.append(A, _);
		const B = () => this.result(e, t, a, s, u, l, m, f, w, C, !1);
		D.append(
			F,
			I("start a different game", "localpartysecondary", () =>
				this.changeGame(t, s, f, w, B, "back to result")
			),
			I("save & exit", "localpartytextbutton", C)
		),
			this.card.append(y, N, W, D),
			this.show(C);
	}
	series(e, t, a, s, u = "back") {
		const l = t.reduce((y, d) => y + d, 0);
		this.begin("SERIES", `${l} ${l === 1 ? "game" : "games"} played`);
		const m = a.length ? We(e, t, a) : null,
			f = document.createElement("div");
		if (((f.className = "localpartyseriesstory"), m && m.kind !== "win")) {
			const y = document.createElement("strong");
			y.textContent = m.label;
			const d = document.createElement("span");
			(d.textContent = m.detail), f.append(y, d);
		}
		const w = document.createElement("div");
		(w.className = "localpartyseriesstandings"),
			w.style.setProperty("--party-size", String(e.length)),
			w.style.setProperty(
				"--party-columns",
				String(e.length > 4 ? 3 : e.length)
			);
		const C = Math.max(...t);
		for (const y of e) {
			const d = document.createElement("div");
			d.style.setProperty("--party-colour", K(y.seat).css),
				C > 0 && t[y.seat] === C && (d.className = "leader");
			const i = document.createElement("i");
			i.setAttribute("aria-hidden", "true");
			const P = document.createElement("span");
			P.textContent = y.name;
			const $ = document.createElement("strong");
			$.textContent = String(t[y.seat] ?? 0);
			const N = document.createElement("small");
			(N.textContent = "wins"), d.append(i, P, $, N), w.appendChild(d);
		}
		const k = document.createElement("p");
		(k.className = "localpartyserieslogtitle"), (k.textContent = "GAMES");
		const E = document.createElement("ol");
		(E.className = "localpartyserieslog"),
			a
				.map((y, d) => ({ game: y, index: d }))
				.reverse()
				.forEach(({ game: y, index: d }) => {
					const i = e[y.winner],
						P = document.createElement("li"),
						$ = document.createElement("span");
					$.textContent = `Game ${d + 1}`;
					const N = document.createElement("span");
					N.style.setProperty("--party-colour", K(i.seat).css);
					const S = document.createElement("i");
					S.setAttribute("aria-hidden", "true");
					const b = document.createElement("strong");
					(b.textContent = `${i.name} won`), N.append(S, b);
					const R = document.createElement("strong");
					(R.textContent = y.scores.join("–")),
						R.setAttribute("aria-label", `Round score ${y.scores.join(", ")}`),
						P.append($, N, R),
						E.appendChild(P);
				});
		const x = Math.max(0, l - a.length);
		if (x) {
			const y = document.createElement("li");
			(y.className = "localpartyterms"),
				(y.textContent = `${x} earlier ${x === 1 ? "game is" : "games are"} included in the series score without detailed results.`),
				E.appendChild(y);
		}
		f.childElementCount && this.card.appendChild(f),
			this.card.append(w, k, E, I(u, "localpartyprimary localpartywide", s)),
			this.show(s);
	}
	penPicker(e, t, a, s, u) {
		const l = a[t],
			m = l.name || De(t);
		let f = l.pen;
		this.begin(`PLAYER ${t + 1} OF ${e}`, `Choose ${m}’s pen`);
		const w = document.createElement("fieldset");
		w.className = "localpartypengrid";
		const C = document.createElement("legend");
		(C.className = "sr-only"),
			(C.textContent = `Choose a pen for ${m}`),
			w.appendChild(C);
		const k = [],
			E = I("", "localpartyprimary", () => s(f)),
			x = document.createElement("p");
		x.className = "localpartypendetail";
		for (const d of Rt) {
			const i = de[d],
				P = document.createElement("label");
			(P.className = "localpartypenoption"),
				(P.dataset.state = d === f ? "selected" : "idle");
			const $ = document.createElement("input");
			($.type = "radio"),
				($.name = `local-party-pen-${t}`),
				($.value = d),
				($.checked = d === f),
				$.setAttribute("aria-label", `${i.name}: ${jt(d)}`);
			const N = document.createElement("img");
			(N.src = Xe(d)),
				(N.alt = ""),
				(N.width = 74),
				(N.height = 42),
				(N.draggable = !1);
			const S = document.createElement("strong");
			(S.textContent = i.short),
				P.append($, N, S),
				$.addEventListener("change", () => {
					f = d;
					for (const b of k) {
						b.label.dataset.state = b.input.checked ? "selected" : "idle";
					}
					(x.textContent = `${i.name} · ${Ot(d)}`),
						(E.textContent = `choose ${i.short}`);
				}),
				k.push({ input: $, label: P }),
				w.appendChild(P);
		}
		(x.textContent = `${de[f].name} · ${Ot(f)}`),
			(E.textContent = `choose ${de[f].short}`);
		const y = document.createElement("div");
		(y.className = "localpartyactions"),
			y.append(I("back", "localpartysecondary", u), E),
			this.card.append(w, x, y),
			this.show(u, "input:checked");
	}
	begin(e, t) {
		this.stopScrollTracking(),
			(this.card.className = "localpartycard"),
			this.card.style.removeProperty("--winner-colour"),
			this.card.replaceChildren();
		const a = document.createElement("p");
		(a.className = "localpartykicker"), (a.textContent = e);
		const s = document.createElement("h1");
		(s.id = `local-party-title-${++this.titleId}`),
			(s.textContent = t),
			this.card.setAttribute("aria-labelledby", s.id);
		const u = document.createElement("header");
		(u.className = "localpartyheading"),
			u.append(a, s),
			this.card.appendChild(u);
	}
	show(e, t) {
		var u;
		this.open ||
			(this.previousFocus =
				document.activeElement instanceof HTMLElement
					? document.activeElement
					: null),
			(this.escapeAction = e),
			this.shade.removeAttribute("inert"),
			this.shade.removeAttribute("aria-hidden"),
			this.shade.classList.add("show"),
			document.body.classList.add("local-party-sheet-open");
		const a = this.card.querySelector(":scope > .localpartyheading");
		let s = this.card.querySelector(":scope > .localpartyscrollbody");
		if (a && !s) {
			(s = document.createElement("div")),
				(s.className = "localpartyscrollbody"),
				s.setAttribute("role", "region"),
				s.setAttribute(
					"aria-labelledby",
					((u = a.querySelector("h1")) == null ? void 0 : u.id) ?? ""
				);
			for (const f of Array.from(this.card.children)) {
				f !== a && s.appendChild(f);
			}
			const l = document.createElement("div");
			(l.className = "localpartyscrollhint"),
				(l.textContent = "more below ↓"),
				l.setAttribute("aria-hidden", "true"),
				this.card.append(s, l);
			const m = () => {
				this.scrollFrame ||
					(this.scrollFrame = requestAnimationFrame(() => {
						(this.scrollFrame = 0), this.updateScrollState(s);
					}));
			};
			s.addEventListener("scroll", m, { passive: !0 }),
				(this.scrollObserver = new ResizeObserver(m)),
				this.scrollObserver.observe(this.card),
				this.scrollObserver.observe(s),
				m();
		}
		s && (s.scrollTop = 0),
			window.setTimeout(() => {
				((t ? this.card.querySelector(t) : null) ?? this.card).focus({
					preventScroll: !0,
				});
			}, 30);
	}
	updateScrollState(e) {
		const a = e.scrollHeight - e.clientHeight > 3,
			s = e.scrollTop <= 3,
			u = e.scrollTop + e.clientHeight >= e.scrollHeight - 3;
		this.card.classList.toggle("localparty-can-scroll", a),
			this.card.classList.toggle("localparty-at-top", !a || s),
			this.card.classList.toggle("localparty-at-bottom", !a || u),
			(e.tabIndex = a ? 0 : -1);
	}
	stopScrollTracking() {
		var e;
		(e = this.scrollObserver) == null || e.disconnect(),
			(this.scrollObserver = null),
			this.scrollFrame && cancelAnimationFrame(this.scrollFrame),
			(this.scrollFrame = 0);
	}
	onKeyDown(e) {
		var u;
		if (e.key === "Escape") {
			e.preventDefault(), (u = this.escapeAction) == null || u.call(this);
			return;
		}
		if (e.key !== "Tab") {
			return;
		}
		const t = Array.from(
			this.card.querySelectorAll(
				'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		);
		if (!t.length) {
			e.preventDefault(), this.card.focus();
			return;
		}
		const a = t[0],
			s = t[t.length - 1];
		e.shiftKey && document.activeElement === a
			? (e.preventDefault(), s.focus())
			: !e.shiftKey &&
				document.activeElement === s &&
				(e.preventDefault(), a.focus());
	}
}
const ea = 900,
	Ht = 5e3,
	Dt = 3200,
	ta = (o) => `player ${o + 1}`;
function j(o) {
	return `local-${o}`;
}
function nt(o) {
	return Number(o.slice(6));
}
function Wt() {
	var o;
	return (
		((o = crypto.randomUUID) == null ? void 0 : o.call(crypto)) ??
		`local-${Date.now()}-${Math.random().toString(36).slice(2)}`
	);
}
function Bt(o) {
	var t;
	return (
		(((t = crypto.getRandomValues) == null
			? void 0
			: t.call(crypto, new Uint32Array(1))[0]) ??
			Math.floor(Math.random() * 4_294_967_295)) % o
	);
}
function na(o) {
	var t;
	const e = Gn(o);
	return {
		...oe,
		bot: { ...oe.bot },
		desk: { ...oe.desk, depth: e.depth, friction: 0.45, width: e.width, z: 0 },
		input: { ...oe.input, jMax: 0.0205, maxPullViewportRatio: 0.31 },
		pen: {
			...oe.pen,
			friction: 0.36,
			selectionRadius:
				(t = window.matchMedia) != null &&
				t.call(window, "(pointer: coarse)").matches
					? 0.042
					: oe.pen.selectionRadius,
		},
		present: { ...oe.present },
		settle: { ...oe.settle },
		sim: { ...oe.sim },
	};
}
function Yt(o, e = []) {
	return H(o).map((t) => {
		var a, s;
		return {
			name: ((a = e[t]) == null ? void 0 : a.name) ?? "",
			pen: ((s = e[t]) == null ? void 0 : s.pen) ?? Be(t),
			seat: t,
		};
	});
}
function ve(o) {
	Ut(), (location.href = o);
}
function at(o = 0) {
	X("local_leave", { size: o }),
		qt(!0),
		Un(),
		(location.href = location.pathname);
}
async function ra(o) {
	document.body.classList.add("local-party-mode"), Kn(), qt();
	const e = new Zn();
	if (o.kind === "home") {
		const n = new URLSearchParams(location.search).get("new") === "1",
			r = n ? null : Je();
		X("local_open", { fresh: n, resume: !!r, size: 0 }),
			e.countPicker(
				r,
				(h) => {
					X("local_size", { resume: !1, size: h }),
						Ze(),
						ve(`${location.pathname}?local=${h}`);
				},
				() => {
					r &&
						(X("local_size", { resume: !0, size: r.state.size }),
						ve(`${location.pathname}?local=${r.state.size}`));
				},
				at
			);
		return;
	}
	if (o.kind !== "game") {
		at();
		return;
	}
	const t = o.size,
		a = () => at(t);
	document.body.classList.add(`local-party-${t}`);
	const s = na(t),
		u = document.fonts.load('24px "Patrick Hand"').catch(() => []),
		l = await dn.create(s);
	await Promise.race([u, new Promise((n) => window.setTimeout(n, 1200))]);
	const m = mn(l, s),
		f = document.getElementById("app"),
		{
			renderer: w,
			scene: C,
			mood: k,
		} = pn({
			maxPixelRatio: 1.5,
			preferHighPerformance: !0,
			preserveDrawingBuffer: !1,
			shadowMapSize: 1024,
		});
	f.replaceChildren(w.domElement);
	const E = hn(),
		x = new fn(!0),
		y = yn(C, s, x, { joinedDesks: t > 3, sparseRoom: t > 3 }),
		d = new gn(s.present.cueMs),
		i = e,
		P = new bn();
	Hn(P), wn();
	const $ = () => M.map((n) => n.name).find((n) => n.trim()) ?? "",
		N = (n) => Fn(!0, n, $()),
		S = new Jn(),
		b = new kn(),
		R = new vn(C),
		D = new En(),
		W = H(t).map(j),
		F = H(t),
		A = {},
		_ = {},
		B = new Map();
	B.set(m.desk.handle, "desk"), B.set(m.floor.handle, "floor");
	let c = null,
		M = Yt(t),
		O = H(t).map(() => 0),
		Y = [],
		xe = "",
		re = 0,
		q = null,
		V = !1,
		fe = !1,
		lt = !1,
		Se = !1,
		me = 0,
		ct = !1,
		it = !1,
		Ce = null,
		Re = null,
		ye = null;
	const pe = document.createElement("div");
	(pe.className = "sr-only"),
		pe.setAttribute("aria-live", "polite"),
		pe.setAttribute("aria-atomic", "true"),
		document.body.appendChild(pe);
	const z = document.createElement("div");
	(z.className = "localpartyturnchit"), z.setAttribute("aria-hidden", "true");
	const ut = document.createElement("strong");
	z.appendChild(ut), document.body.appendChild(z);
	let Ie = 64,
		Te = 15,
		Ye = -1;
	const J = document.createElement("div");
	(J.className = "localpartyroundcue"),
		J.setAttribute("inert", ""),
		J.setAttribute("aria-hidden", "true");
	const dt = document.createElement("strong"),
		mt = document.createElement("span"),
		ge = document.createElement("button");
	(ge.type = "button"),
		(ge.textContent = "next round"),
		J.append(dt, mt, ge),
		document.body.appendChild(J);
	const Ge = document.createElement("div");
	Ge.className = "localpartycontrols";
	const Q = document.createElement("button");
	(Q.type = "button"),
		(Q.className = "boardbtn localpartyfullscreen"),
		(Q.textContent = "full screen"),
		Q.setAttribute("aria-label", "enter full screen");
	const te = document.createElement("button");
	(te.type = "button"),
		(te.className = "boardbtn localpartypause"),
		(te.textContent = "menu"),
		te.setAttribute("aria-label", "open game menu"),
		Ge.append(Q, te),
		document.body.appendChild(Ge);
	const Z = () => V || fe || lt,
		Fe = () => {
			const n = te.classList.contains("show") && !Z() && !i.open;
			Q.classList.toggle("show", n && qn());
		},
		ke = () => {
			te.classList.add("show"), Fe();
		},
		be = () => {
			te.classList.remove("show"), Q.classList.remove("show");
		},
		pt = [1.5, 1.25, 1];
	let je = 0,
		$e = 0,
		ze = 0,
		ht = performance.now();
	const Kt = () => {
			const n = Math.min(window.devicePixelRatio, pt[je]);
			if (Math.abs(w.getPixelRatio() - n) < 0.01) {
				return;
			}
			w.setPixelRatio(n);
			const { w: r, h } = Ne();
			w.setSize(r, h, !1);
		},
		Vt = (n, r) => {
			if (Z() || r - ht < 900) {
				($e = 0), (ze = 0);
				return;
			}
			if (($e++, (ze += n), $e < 60)) {
				return;
			}
			const h = ze / $e;
			($e = 0),
				(ze = 0),
				!(h <= 22 || je >= pt.length - 1) && (je++, (ht = r), Kt());
		};
	let qe = null,
		ft = () => {};
	const yt = () => {
		const { w: n, h: r } = Ne(),
			h = n >= r;
		qe !== null && qe !== h && ft(),
			(qe = h),
			Xn(E, s, t, { h: r, w: n }),
			E.updateMatrixWorld(!0),
			w.setSize(n, r);
		const g = new he(0, 0, 0).project(E);
		d.setAnchor(((g.x + 1) / 2) * n, ((1 - g.y) / 2) * r);
		const p = s.desk.width / 2,
			v = s.desk.depth / 2;
		let L = 1 / 0,
			T = -1 / 0,
			ee = -1 / 0,
			ie = 1 / 0;
		for (const [se, ue] of [
			[-p, -v],
			[p, -v],
			[-p, v],
			[p, v],
		]) {
			g.set(se, 0, ue).project(E);
			const At = ((g.x + 1) / 2) * n,
				Pt = ((1 - g.y) / 2) * r;
			(L = Math.min(L, At)),
				(T = Math.max(T, At)),
				ue > 0 ? (ee = Math.max(ee, Pt)) : (ie = Math.min(ie, Pt));
		}
		$n(y, E, s, r),
			g.set(0, y.boardBottomY, y.boardZ).project(E),
			d.setDeskRect({
				board: ((1 - g.y) / 2) * r,
				far: ie,
				left: L,
				near: ee,
				right: T,
			});
	};
	yt();
	const U = (n) => {
			var r;
			return ((r = M[n]) == null ? void 0 : r.name) ?? ta(n);
		},
		Qt = () => W.map((n) => On(A[n])),
		gt = (n) => {
			var h, g;
			const r = H(t)
				.map((p) => {
					var v;
					return ((v = n[p]) == null ? void 0 : v.pen) ?? Be(p);
				})
				.join("|");
			if (r !== xe) {
				for (const p of W) {
					A[p] && l.world.removeRigidBody(A[p].body),
						(h = _[p]) == null || h.dispose();
				}
				(l.tracked.length = 0),
					B.clear(),
					B.set(m.desk.handle, "desk"),
					B.set(m.floor.handle, "floor");
				for (const p of H(t)) {
					const v = j(p),
						L = de[((g = n[p]) == null ? void 0 : g.pen) ?? Be(p)],
						T = Ft(t, (c == null ? void 0 : c.state().layoutRotation) ?? 0, p);
					(A[v] = An(
						l,
						s,
						v,
						{ x: T.x, y: L.radius + 5e-4, z: T.z },
						T.yaw,
						L
					)),
						l.track(A[v].body),
						(_[v] = new Pn(C, A[v], L.id, {
							color: K(p).three,
							recolourBody: !1,
						})),
						_[v].setOwnerMarked(!0);
					for (const ee of A[v].colliders) {
						B.set(ee.handle, v);
					}
				}
				l.snapTransforms(), (xe = r);
			}
		};
	gt(M);
	const Ae = () => {
			const n = c == null ? void 0 : c.state(),
				r = M.map((h) => `${K(h.seat).label} · ${h.name}`);
			x.drawParty(
				r,
				(n == null ? void 0 : n.scores) ?? H(t).map(() => 0),
				(n == null ? void 0 : n.outs) ?? [],
				(n == null ? void 0 : n.targetWins) ?? (t >= 4 ? 2 : 3)
			);
		},
		_e = () => {
			if (!c) {
				return;
			}
			const n = c.state();
			for (const r of H(t)) {
				const h = j(r),
					g = Ft(t, n.layoutRotation, r);
				_n(A[h], { x: g.x, y: A[h].radius + 5e-4, z: g.z }, g.yaw),
					(_[h].group.visible = !0);
			}
			l.snapTransforms(), (re = performance.now() + 1800);
		},
		ne = (n = !1) => {
			if (!c) {
				return;
			}
			const r = c.state();
			if ((Ae(), r.phase !== "aiming" || r.activeSeat === null)) {
				d.clearTurn(), z.classList.remove("show");
				return;
			}
			const h = r.activeSeat,
				g = K(h),
				p = de[M[h].pen],
				v = Gt(h, t, new Set(r.outs));
			d.clearTurn(),
				(ut.textContent = `${U(h)}’s turn`),
				z.classList.remove("positioned"),
				z.classList.toggle("show", Ye !== r.turn),
				Ye !== r.turn && ((Ie = z.offsetWidth / 2), (Te = z.offsetHeight / 2)),
				n &&
					(pe.textContent = `${U(h)}'s turn with the ${g.label} ${p.name}. ${v === null || v === h ? "" : `${U(v)} is next.`}`);
		},
		Xt = () => {
			if (!(z.classList.contains("show") && c)) {
				return;
			}
			const n = c.state();
			if (n.phase !== "aiming" || n.activeSeat === null) {
				return;
			}
			const { w: r, h } = Ne(),
				g = Rn(A[j(n.activeSeat)], !0, E, s, r, h, 0),
				p = Qn(g, { cueHalfHeight: Te, cueHalfWidth: Ie, height: h, width: r });
			if (!p) {
				z.classList.remove("show");
				return;
			}
			(z.style.left = `${p.x}px`), (z.style.top = `${p.y}px`);
			const v = 10,
				L = Math.max(-Ie + v, Math.min(Ie - v, p.anchorX - p.x));
			z.style.setProperty("--turn-cue-tail-x", `${L}px`);
			const T =
				p.placement === "above" ? p.anchorY - p.y - Te : p.y - Te - p.anchorY;
			z.style.setProperty("--turn-cue-tail-height", `${Math.max(5, T)}px`),
				z.classList.toggle("below", p.placement === "below"),
				z.classList.add("positioned");
		},
		le = () => {
			c && Tn(M, c.state(), O, Qt(), Y);
		},
		bt = (n) => {
			const r = A[n].body.linvel();
			return Math.hypot(r.x, r.y, r.z);
		},
		Jt = (n, r) => {
			const h = A[n].body.linvel(),
				g = A[r].body.linvel();
			return Math.hypot(h.x - g.x, h.y - g.y, h.z - g.z);
		},
		Ue = () => {
			J.classList.remove("show"),
				J.setAttribute("inert", ""),
				J.setAttribute("aria-hidden", "true"),
				(Ce = null),
				(Re = null);
		},
		wt = () => {
			if (!(c != null && c.nextRound())) {
				return;
			}
			Ue(), _e(), ne(!0), le();
			const n = c.state().opener;
			d.showCue(`pass to ${U(n)} · ${K(n).label} pen`, "↗");
		};
	ge.addEventListener("click", wt);
	const Pe = (n = !0) => {
			if (((ye = null), !c)) {
				return;
			}
			const r = c.state();
			r.winner !== null &&
				((V = !0),
				ce.cancelAim(),
				Mn(!0),
				i.result(
					M[r.winner],
					M,
					r.scores,
					O,
					Y,
					N(() => {
						const h = c.state();
						(c = new et(Wt(), t, {
							fairnessCursor: h.fairnessCursor + 1,
							layoutSeed: h.layoutSeed,
							openerSeed: h.openerSeed,
						})),
							i.close(),
							(V = !1),
							d.setPlaying(!0),
							ke(),
							_e(),
							ne(!0),
							le();
					}),
					() => i.series(M, O, Y, () => Pe(!1), "back to result"),
					() =>
						i.confirm(
							"Edit players?",
							"Your current series stays saved until you start the new game.",
							"edit players",
							() => {
								Ke(M);
							},
							() => Pe(!1)
						),
					() =>
						i.confirm(
							"Choose a different group size?",
							"Your current series stays saved until you choose a new group size.",
							"change group size",
							() => {
								ve(`${location.pathname}?local=play&new=1`);
							},
							() => Pe(!1)
						),
					N(a),
					n
				));
		},
		vt = (n) => {
			const r = n.scores.join("–");
			if ((z.classList.remove("show"), n.phase === "match_end")) {
				be();
				const p = n.winner;
				Y.some((L) => L.matchId === n.matchId) ||
					(Y.push({
						matchId: n.matchId,
						roundWinners: [...n.roundWinners],
						scores: [...n.scores],
						winner: p,
					}),
					O[p]++),
					le(),
					zn("local", n.matchId, {
						games: Y.length,
						names: M.map((L) => L.name),
						pens: M.map((L) => L.pen),
						rounds: n.round,
						scores: [...n.scores],
						session_wins: [...O],
						size: t,
						winner: p,
					});
				const v = We(M, O, Y);
				d.setPlaying(!1),
					d.showResult(`${U(p).toUpperCase()} WINS · ${v.label}`, Dt),
					(pe.textContent = `${U(p)} wins the game, ${r}. ${v.detail}`),
					b.duckAmbience(4200),
					window.setTimeout(() => b.matchBell(), 260),
					window.setTimeout(
						() =>
							v.kind === "streak" && v.streak >= 3
								? b.rewardCheer()
								: b.cheer(),
						850
					),
					(ye = me + Dt),
					X("local_match_end", { games: Y.length, rounds: n.round, size: t });
				return;
			}
			const h = n.roundWinners[n.roundWinners.length - 1],
				g =
					h === null
						? `Round ${n.round} is a draw`
						: `${U(h)} wins round ${n.round}`;
			d.showResult(`${g.toUpperCase()} · ${r}`, Ht),
				(pe.textContent = `${g}. Score ${r}.`),
				X("local_round", { draw: h === null, round: n.round, size: t }),
				(dt.textContent = g),
				(mt.textContent = `${r} · next round starts automatically`),
				(ge.disabled = !0),
				J.classList.add("show"),
				J.removeAttribute("inert"),
				J.removeAttribute("aria-hidden"),
				(Ce = me + ea),
				(Re = me + Ht);
		},
		Zt = () => {
			if (!c || c.state().phase !== "settling") {
				return;
			}
			const n = c.state(),
				r = F.filter((v) => A[j(v)].body.translation().y < s.present.outY),
				h = c.settle(n.turn, r),
				g = h.state,
				p = g.outs.filter((v) => !n.outs.includes(v));
			for (const v of p) {
				_[j(v)].group.visible = !1;
			}
			if ((Ae(), le(), h.kind === "continue")) {
				ne(!0);
				const v = `pass to ${U(g.activeSeat)} · ${K(g.activeSeat).label} pen`;
				d.flashTurn(
					p.length ? `${p.map((L) => U(L)).join(" and ")} out · ${v}` : v,
					"↗",
					2200
				);
				return;
			}
			vt(g);
		},
		en = () => {
			if (!c || c.state().phase !== "aiming") {
				return;
			}
			const n = c.state(),
				r = F.filter(
					(L) =>
						!n.outs.includes(L) && A[j(L)].body.translation().y < s.present.outY
				),
				h = c.recordLateOuts(r);
			if (!h) {
				return;
			}
			const g = h.state,
				p = g.outs.filter((L) => !n.outs.includes(L));
			for (const L of p) {
				_[j(L)].group.visible = !1;
			}
			if ((Ae(), le(), h.kind !== "continue")) {
				vt(g);
				return;
			}
			ne(!0);
			const v = p.map((L) => U(L)).join(" and ");
			if (g.activeSeat === n.activeSeat) {
				d.flashTurn(`${v} out · ${U(g.activeSeat)} still plays`, "↗", 1800);
			} else {
				const L = `pass to ${U(g.activeSeat)} · ${K(g.activeSeat).label} pen`;
				d.flashTurn(`${v} out · ${L}`, "↗", 2200);
			}
		},
		ce = new xn(
			w.domElement,
			E,
			A,
			s,
			(n, r) => {
				if (!c || Z()) {
					return;
				}
				const h = nt(n),
					g = c.state();
				if (
					c.beginShot(h, g.turn) &&
					(Dn(A[n], r, s),
					D.start(performance.now()),
					b.snap(r.power),
					ne(),
					!it)
				) {
					it = !0;
					const p = localStorage.getItem("pf_first_shot") !== "1";
					localStorage.setItem("pf_first_shot", "1"),
						X("first_shot", { first: p, mode: "local", size: t });
				}
			},
			(n) => !Z() && !!(c != null && c.canShoot(nt(n))),
			(n) => {
				const r = nt(n);
				d.showCue(`${U(r)} · ${K(r).label} · ${de[M[r].pen].name}`, "✋");
			},
			Sn,
			{ coarse: 76, fine: 38 }
		);
	(ft = () => ce.cancelAim()),
		w.domElement.addEventListener("pointerdown", () => {
			const n = ce.getAim(),
				r = c == null ? void 0 : c.state();
			!(n && r) ||
				r.phase !== "aiming" ||
				((Ye = r.turn), z.classList.remove("show"));
		});
	const tn = () => {
		i.close(!0), (V = !1), ke(), ne(!0);
	};
	Q.addEventListener("click", async () => {
		ce.cancelAim(), (Q.disabled = !0), (Q.textContent = "opening…");
		const n = jn() ? await rt() : !1;
		if (((Q.disabled = !1), (Q.textContent = "full screen"), n || Ee())) {
			Fe();
			return;
		}
		(V = !0), be(), z.classList.remove("show"), i.fullscreenHelp(tn);
	}),
		document.addEventListener("fullscreenchange", Fe),
		document.addEventListener("webkitfullscreenchange", Fe);
	const nn = (n) => {
		if (!n || n.length !== t) {
			_e();
			return;
		}
		for (const r of H(t)) {
			In(A[j(r)], n[r]);
		}
		l.snapTransforms();
		for (const r of H(t)) {
			_[j(r)].group.visible = !(c != null && c.state().outs.includes(r));
		}
	};
	function Et(n, r, h) {
		(M = n.map((v) => ({ ...v }))),
			r
				? ((c = new et(r.matchId, t, {}, r)),
					r.phase === "round_result" && (c.nextRound(), (h = null)))
				: (Ze(),
					(O = H(t).map(() => 0)),
					(Y = []),
					(c = new et(Wt(), t, { layoutSeed: Bt(t), openerSeed: Bt(t) }))),
			gt(M),
			i.close(),
			nn(h);
		const g = c;
		if ((g == null ? void 0 : g.state().phase) === "settling") {
			const v = F.filter((T) => !g.state().outs.includes(T));
			if (v.some((T) => !Ln(A[j(T)], s))) {
				for (const T of v) {
					A[j(T)].body.wakeUp();
				}
				D.start(performance.now());
			} else {
				g.resumeInterruptedShot();
			}
		}
		if (c.state().phase === "match_end") {
			(V = !0), d.setPlaying(!1), be(), z.classList.remove("show"), Pe();
			return;
		}
		(V = !1), d.setPlaying(!0), ke(), ne(!0), le();
		const p = c.state().activeSeat;
		d.showCue(`${U(p)} opens · pass after the pens stop`, "✎"),
			X("local_match_start", {
				games: Y.length,
				phase: c.state().phase,
				resume: !!r,
				size: t,
			});
	}
	const xt = () => {
			const { w: n, h: r } = Ne();
			return Vn(t, n, r);
		},
		St = (n) => {
			z.classList.remove("show"),
				S.show({
					backLabel: n ? "back to players" : "pause menu",
					onBack: n
						? () => {
								(q = null), (fe = !1), S.hide(!0);
							}
						: () => kt(),
					onTry: _t,
					size: t,
				});
		};
	function Ct(n, r, h) {
		if (!xt()) {
			Et(n, r, h);
			return;
		}
		(q = { frames: h, participants: n.map((g) => ({ ...g })), restored: r }),
			(fe = !0),
			St(!0),
			_t();
	}
	function Ke(n = []) {
		(c = null),
			(q = null),
			(V = !0),
			(fe = !1),
			S.hide(),
			Ue(),
			(ye = null),
			d.setPlaying(!1),
			be(),
			Ae(),
			X("local_setup", { size: t }),
			i.setup(
				t,
				Yt(t, n),
				(r) => Ct(r),
				() => {
					ve(`${location.pathname}?local=play`);
				},
				a
			);
	}
	function kt() {
		if (!c || c.state().phase === "match_end") {
			return;
		}
		const n = c.state().phase;
		S.hide(), (V = !0), ce.cancelAim(), z.classList.remove("show"), be();
		const r = () =>
			i.pause(
				Se,
				{
					activeSeat: c.state().activeSeat,
					gameHistory: Y,
					participants: M,
					round: c.state().round,
					scores: c.state().scores,
					sessionWins: O,
					targetWins: c.state().targetWins,
				},
				{
					onCount: () =>
						i.confirm(
							"Choose a different group size?",
							"Your current series stays saved until you choose a new group size.",
							"change group size",
							() => {
								ve(`${location.pathname}?local=play&new=1`);
							},
							r
						),
					onExit: a,
					onPlayers: () =>
						i.confirm(
							"Edit players?",
							"Your current series stays saved until you start the new game.",
							"edit players",
							() => {
								Ke(M);
							},
							r
						),
					onRestart:
						n === "aiming" || n === "settling"
							? () =>
									i.confirm(
										"Restart this round?",
										"Scores stay the same. Pens return to their starting positions.",
										"restart round",
										() => {
											Ue(),
												(ye = null),
												c == null || c.restartRound(),
												_e(),
												le(),
												r();
										},
										r
									)
							: void 0,
					onResume: () => {
						i.close(!0), (V = !1), ke(), ne(!0);
					},
					onSeries: () => i.series(M, O, Y, r, "back to game menu"),
					onSound: () => {
						(Se = !Se), b.setAmbMuted(Se), b.setGameMuted(Se), r();
					},
				}
			);
		r();
	}
	te.addEventListener("click", kt);
	const an = () => {
			if (xt()) {
				(q || (c && !V)) &&
					!S.open &&
					((fe = !0), ce.cancelAim(), be(), St(!!q));
				return;
			}
			if (S.open) {
				if ((S.hide(), (fe = !1), q)) {
					const r = q;
					(q = null), Et(r.participants, r.restored, r.frames);
				} else {
					c && !V && (ke(), ne(!0));
				}
			}
		},
		$t = () => {
			b.unlock();
		};
	w.domElement.addEventListener("pointerdown", $t, { once: !0 }),
		window.addEventListener("touchend", $t, { once: !0, passive: !0 });
	const ae = Je(t),
		Ve = Je();
	X("local_open", { resume: !!ae, size: t }),
		ae
			? ((M = ae.participants),
				(O = ae.sessionWins),
				(Y = ae.gameHistory),
				Ae(),
				i.countPicker(
					ae,
					(n) => {
						X("local_size", { resume: !1, size: n }),
							Ze(),
							ve(`${location.pathname}?local=${n}`);
					},
					() => Ct(ae.participants, ae.state, ae.frames),
					a
				))
			: Ke((Ve == null ? void 0 : Ve.participants) ?? []);
	let Oe = performance.now(),
		we = 0,
		He = 0;
	const sn = Cn(yt),
		on = () => {
			if (Z()) {
				b.setSlideLevel(0);
				return;
			}
			let n = 0;
			for (const r of W) {
				const h = A[r].body.translation();
				if (h.y < -0.02 || h.y > 0.02) {
					continue;
				}
				const g = A[r].body.linvel();
				n = Math.max(n, (Math.hypot(g.x, g.z) - 0.06) / 1.4);
			}
			b.setSlideLevel(n);
		},
		Qe = (n) => {
			sn.tick(), an(), b.setRoomHeard(d.matchOn && !i.open && !S.open);
			const r = Math.min(250, n - Oe);
			if (((Oe = n), Vt(r, n), !Z())) {
				(me += r), (we += r / 1e3);
				let p = 0;
				while (we >= s.sim.dt && p < s.sim.maxSubSteps) {
					l.step(),
						l.drainCollisions((v, L, T) => {
							if (!T) {
								return;
							}
							const ee = B.get(v),
								ie = B.get(L);
							if (!(ee && ie)) {
								return;
							}
							const se = [ee, ie].filter(
								(ue) => ue !== "desk" && ue !== "floor"
							);
							if (se.length === 2 && ee !== ie) {
								b.clack(Jt(se[0], se[1]));
							} else if (se.length === 1) {
								const ue = ee === se[0] ? ie : ee;
								ue === "floor"
									? b.floorThud(bt(se[0]))
									: ue === "desk" && b.deskTap(bt(se[0]));
							}
						}),
						(we -= s.sim.dt),
						p++;
				}
				p === s.sim.maxSubSteps && (we = 0),
					Ce !== null && me >= Ce && ((ge.disabled = !1), (Ce = null)),
					Re !== null && me >= Re && wt(),
					ye !== null && me >= ye && Pe();
			}
			on();
			const h = we / s.sim.dt;
			for (let p = 0; p < W.length; p++) {
				_[W[p]].sync(l.tracked[p], h);
			}
			if (
				(Z() || en(),
				Xt(),
				!Z() && (c == null ? void 0 : c.state().phase) === "settling")
			) {
				const p = new Set(c.state().outs),
					v = new Set(
						F.filter((T) => A[j(T)].body.translation().y < s.present.outY)
					),
					L = F.filter((T) => !(p.has(T) || v.has(T))).map((T) => A[j(T)]);
				D.isSettled(L, s, n) && Zt();
			}
			const g = Z() ? null : ce.getAim();
			!ct && g && ((ct = !0), X("first_aim", { mode: "local", size: t })),
				R.update(g, A, s);
			for (const p of F) {
				const v = j(p),
					L =
						!Z() &&
						!!(c != null && c.canShoot(p)) &&
						(g == null ? void 0 : g.penId) !== v,
					T = !Z() && n < re;
				_[v].setPulse(L || T ? Nn(n) : 0);
			}
			k.tick(n), w.render(C, E), (He = requestAnimationFrame(Qe));
		};
	(He = requestAnimationFrame(Qe)),
		document.addEventListener("visibilitychange", () => {
			if (
				((lt = document.hidden),
				ce.cancelAim(),
				b.setSlideLevel(0),
				document.hidden)
			) {
				le(), cancelAnimationFrame(He);
				return;
			}
			b.wake();
			const n = performance.now();
			D.shiftClocks(Math.max(0, n - Oe)),
				(Oe = n),
				(we = 0),
				(He = requestAnimationFrame(Qe));
		});
}
export { ra as bootLocalParty };
