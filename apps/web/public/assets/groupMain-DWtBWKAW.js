var Is = Object.defineProperty;
var $s = (r, e, a) =>
	e in r
		? Is(r, e, { configurable: !0, enumerable: !0, value: a, writable: !0 })
		: (r[e] = a);
var k = (r, e, a) => $s(r, typeof e == "symbol" ? e : e + "", a);
import {
	aK as _a,
	aO as $a,
	b as $t,
	R as Aa,
	aw as An,
	a4 as As,
	au as aa,
	ar as Bs,
	aG as ba,
	an as bt,
	aT as Ca,
	ay as Cn,
	a7 as Cs,
	aA as ca,
	a$ as Da,
	aN as Dn,
	ag as Ds,
	f as da,
	U as Ea,
	ap as En,
	a3 as Es,
	u as ea,
	b0 as Fa,
	aY as Fn,
	ai as Fs,
	aC as fa,
	ad as fe,
	a_ as Ga,
	I as Gn,
	ac as Gs,
	aF as ga,
	m as Hs,
	v as ha,
	aL as Ia,
	z as ia,
	k as Js,
	Q as ja,
	ax as jn,
	a5 as js,
	ak as Ks,
	aH as ka,
	W as La,
	aJ as Ln,
	C as Ls,
	aB as la,
	aZ as Ma,
	am as Me,
	aM as Mn,
	w as Ms,
	E as ma,
	N as Na,
	al as Nn,
	a2 as Ns,
	at as na,
	aX as Oa,
	aI as On,
	aa as Os,
	y as oa,
	aR as Pa,
	a6 as Pn,
	a0 as Ps,
	V as pa,
	aP as Qe,
	T as Qn,
	e as Qs,
	ab as Qt,
	aW as qa,
	aE as qn,
	aS as Ra,
	ae as Rn,
	a1 as Rs,
	B as ra,
	K as Sa,
	A as sa,
	aQ as Ta,
	Z as Ts,
	H as ta,
	X as Ua,
	aV as Un,
	ah as Us,
	D as ua,
	$ as Vn,
	as as Vs,
	G as va,
	af as vt,
	aj as Ws,
	F as wa,
	S as Xs,
	av as Xt,
	aU as xa,
	az as xn,
	a8 as xs,
	_ as Yn,
	o as Ys,
	aD as ya,
	q as Zs,
	ao as Zt,
	h as z,
	aq as zs,
} from "./main-NZF1ugMT.js";
import "./index-DyrlfgZ-.js";
const Tt = 2;
function $e(r) {
	return `seat-${r}`;
}
const sn = "group-v2-lab-rewards";
class L extends Error {
	constructor(e, a = "network") {
		super(e), (this.code = a), (this.name = "GroupApiError");
	}
}
function It(r) {
	if (!r || typeof r != "object" || Array.isArray(r)) {
		throw new L("invalid desk answer", "invalid");
	}
	return r;
}
function Wn(r) {
	if (typeof r === "number" && r >= 0 && r < 6) {
		return r;
	}
	throw new L("invalid seat", "invalid");
}
function De(r) {
	const e = It(r),
		a = Array.isArray(e.members)
			? e.members.map((f) => {
					const p = It(f),
						v = String(p.pen ?? "reynolds045");
					if (!$t[v]) {
						throw new L(
							"somebody at this desk has a newer pen fight. refresh to play.",
							"newer_build"
						);
					}
					return {
						name: String(p.name ?? "someone"),
						pen: v,
						present: p.present !== !1,
						ready: p.ready === !0,
						seat: Wn(p.seat),
						userId: String(p.user_id ?? ""),
					};
				})
			: [],
		c = e.status,
		d = Array.isArray(e.drop_votes)
			? e.drop_votes.map((f) => {
					const p = It(f);
					return {
						reporterUserId: String(p.reporter_user_id ?? ""),
						targetUserId: String(p.target_user_id ?? ""),
					};
				})
			: [];
	if (!["waiting", "terms", "playing", "ended", "closed"].includes(String(c))) {
		throw new L("invalid desk status", "invalid");
	}
	return {
		code: String(e.code ?? ""),
		dropVotes: d,
		matchNo: Number(e.match_no ?? 0),
		members: a,
		mySeat: Wn(e.my_seat),
		pens: e.pens && typeof e.pens == "object" ? e.pens : null,
		roomId: String(e.room_id ?? ""),
		rosterRevision: Number(e.roster_revision ?? 0),
		state: e.state && typeof e.state == "object" ? e.state : null,
		status: c,
		topic: String(e.topic ?? ""),
		transitionOwnerUserId: e.transition_owner_user_id
			? String(e.transition_owner_user_id)
			: null,
		userId: String(e.user_id ?? ""),
	};
}
async function Te(r, e, a, c = 5e3) {
	try {
		return a ? await Ts(a, r, e, c) : (await Yn(r, e, c)).value;
	} catch (d) {
		throw d instanceof Vn
			? new L(d.message, d.code)
			: new L(d instanceof Error ? d.message : "the desk line is offline");
	}
}
async function Zn(r, e, a) {
	try {
		const c = await Yn(r, e, 9e3),
			d = De(c.value);
		return Ps(d.roomId, d.userId, c.token), d;
	} catch (c) {
		throw c instanceof Vn
			? new L(c.message, c.code)
			: c instanceof L
				? c
				: new L(c instanceof Error ? c.message : "the desk line is offline");
	}
}
function Wa() {
	const r = "abcdefghjkmnpqrstuvwxyz23456789",
		e = crypto.getRandomValues(new Uint8Array(6));
	return Array.from(e, (a) => r[a % r.length]).join("");
}
function Ka(r, e, a) {
	return Zn("group_create_room_v2", {
		p_build: sn,
		p_code: r,
		p_name: e,
		p_pen: a,
		p_protocol: Tt,
	});
}
function za(r, e, a) {
	return Zn("group_join_room_v2", {
		p_build: sn,
		p_code: r,
		p_name: e,
		p_pen: a,
		p_protocol: Tt,
	});
}
async function kt(r) {
	return De(await Te("group_status_v1", { p_room: r }, r, 3e3));
}
async function Ba(r, e, a) {
	return De(
		await Te(
			"group_ready_v2",
			{ p_match_no: e, p_pen: a, p_protocol: Tt, p_room: r },
			r,
			4e3
		)
	);
}
async function Ja(r) {
	return De(
		await Te(
			"group_commit_frame_v1",
			{
				p_expected_revision: r.expectedRevision,
				p_match_no: r.matchNo,
				p_pens: r.pens,
				p_room: r.roomId,
				p_state: r.state,
			},
			r.roomId,
			5e3
		)
	);
}
function Xn(r) {
	const e = It(r);
	if (
		(e.status !== "committed" && e.status !== "duplicate") ||
		!Number.isInteger(e.revision) ||
		!Number.isInteger(e.turn) ||
		typeof e.command_id != "string" ||
		!Rs(e.package) ||
		!e.state ||
		typeof e.state != "object" ||
		Array.isArray(e.state)
	) {
		throw new L("invalid accepted group turn", "invalid");
	}
	const a = e.state;
	if (
		e.package.commandId !== e.command_id ||
		e.package.turn !== e.turn ||
		e.package.bout < 1 ||
		a.revision !== e.revision ||
		e.package.baseRevision + 2 !== e.revision
	) {
		throw new L("group turn receipt does not match its package", "invalid");
	}
	return {
		commandId: e.command_id,
		package: e.package,
		revision: e.revision,
		state: a,
		status: e.status,
		turn: e.turn,
	};
}
async function Ha(r) {
	return Xn(
		await Te(
			"group_commit_turn_v2",
			{
				p_base_revision: r.package.baseRevision,
				p_build: sn,
				p_command: r.package.commandId,
				p_match_no: r.matchNo,
				p_package: r.package,
				p_protocol: Tt,
				p_room: r.roomId,
				p_state: r.state,
				p_turn: r.package.turn,
			},
			r.roomId,
			7e3
		)
	);
}
async function Ya(r) {
	const e = await Te(
		"group_turns_since_v2",
		{
			p_after_revision: r.afterRevision,
			p_match_no: r.matchNo,
			p_room: r.roomId,
		},
		r.roomId,
		4e3
	);
	if (!Array.isArray(e)) {
		throw new L("invalid group turn history", "invalid");
	}
	return e.map(Xn).sort((a, c) => a.revision - c.revision);
}
async function Va(r) {
	await Te("group_leave_v1", { p_room: r }, r, 3e3);
}
async function Qa(r) {
	return De(await Te("group_present_v1", { p_room: r }, r, 3e3));
}
async function Kn(r, e, a) {
	return De(
		await Te(
			"group_report_absent_v1",
			{ p_match_no: e, p_room: r, p_target: a },
			r,
			4e3
		)
	);
}
const Za = {
	0: { css: "#24262b", ink: "#f6f0df", label: "black", three: 2_369_067 },
	1: { css: "#2458b8", ink: "#f6f0df", label: "blue", three: 2_382_008 },
	2: { css: "#237552", ink: "#f6f0df", label: "green", three: 2_323_794 },
	3: { css: "#c83232", ink: "#f6f0df", label: "red", three: 13_120_050 },
	4: { css: "#7e38b7", ink: "#f6f0df", label: "purple", three: 8_272_055 },
	5: { css: "#d96b27", ink: "#f6f0df", label: "orange", three: 14_248_743 },
};
function de(r) {
	return Za[r] || Za[0];
}
const zn = () =>
	'<button class="stampbtn" type="button" data-link>send a link</button><p class="or">or</p><button class="stampbtn" type="button" data-find>find someone</button>';
function J(r) {
	return r.replace(
		/[&<>"']/g,
		(e) =>
			({ "'": "&#39;", '"': "&quot;", "&": "&amp;", "<": "&lt;", ">": "&gt;" })[
				e
			]
	);
}
class Xa {
	constructor() {
		k(this, "wrap", document.createElement("div"));
		k(this, "card", document.createElement("section"));
		k(this, "copyState", "idle");
		k(this, "checkState", "idle");
		k(this, "copyReset", null);
		k(this, "checkReset", null);
		k(this, "viewKey", "");
		k(this, "motionCleanup", null);
		k(this, "standings", []);
		k(this, "mark", () => "");
		(this.wrap.className = "chitwrap group-sheet"),
			this.wrap.setAttribute("aria-live", "polite"),
			(this.card.className = "chit group-paper"),
			this.card.setAttribute("role", "dialog"),
			this.card.setAttribute("aria-modal", "true"),
			this.wrap.appendChild(this.card),
			document.body.appendChild(this.wrap),
			this.wrap.addEventListener("click", (e) => {
				this.viewKey === "idle-ask" &&
					e.target === this.wrap &&
					e.stopPropagation();
			}),
			this.card.addEventListener("keydown", (e) => {
				e.key === "Escape" && this.viewKey === "idle-ask" && e.preventDefault();
			});
	}
	setStandings(e) {
		this.standings = e;
	}
	setMarks(e) {
		this.mark = e;
	}
	refreshMarks(e) {
		for (const a of e) {
			for (const c of this.card.querySelectorAll(
				`[data-member="${a.userId}"]`
			)) {
				c.querySelector(".cupmark") ||
					c.insertAdjacentHTML("beforeend", this.mark(a));
			}
		}
	}
	named(e) {
		return `<span class="group-name" data-member="${J(e.userId)}"><span class="group-name-text">${J(e.name)}</span>${this.mark(e)}</span>`;
	}
	show(e, a) {
		var d;
		const c = e !== this.viewKey;
		if (c) {
			(d = this.motionCleanup) == null || d.call(this),
				(this.motionCleanup = null),
				(this.viewKey = e),
				(this.card.dataset.view = e.split(":")[0]),
				(this.card.innerHTML = `<div class="brand">${Ns(22)}<span>PEN FIGHT</span></div>${a}`),
				this.card.classList.toggle(
					"verification",
					a.includes('id="pf-human-check"')
				);
			const f = this.card.querySelector("h2");
			f &&
				((f.id = "group-sheet-title"),
				this.card.setAttribute("aria-labelledby", f.id));
		}
		return (
			this.wrap.classList.add("show"),
			this.wrap.removeAttribute("inert"),
			Es(e.split(":")[0] ?? "group"),
			c
		);
	}
	close(e = !1) {
		this.wrap.classList.contains("show") && Cs(e),
			this.wrap.classList.remove("show"),
			this.wrap.setAttribute("inert", "");
	}
	opening(e, a) {
		var d;
		!(
			this.show(
				`opening:${e}:${!!a}`,
				"" +
					`<p class="eyebrow">${typeof targetSize === "undefined" ? 3 : targetSize} PLAYER DESK</p>` +
					`<h2>${e ? "finding your seat…" : "opening a bigger desk…"}</h2><div class="group-loader" aria-label="working"></div><p class="quiet" id="pf-human-check-status">checking the line…</p><div id="pf-human-check" class="humancheck" aria-hidden="true"></div><p class="quiet group-opening-detail">same flick. one more pen.</p>${a ? '<button class="pencil-link" type="button" data-back>back to class</button>' : ""}`
			) && a
		) ||
			(d = this.card.querySelector("[data-back]")) == null ||
			d.addEventListener("click", a);
	}
	openingSlow(e) {
		const a = this.card.querySelector("h2"),
			c = this.card.querySelector(".group-opening-detail");
		a &&
			(a.textContent = e
				? "still finding your seat…"
				: "still opening the desk…"),
			c && (c.textContent = "the line is slow, but it is still working.");
	}
	invalidInvite(e, a) {
		var c, d;
		this.show(
			"invalid-invite",
			'`+`<p class="eyebrow">${(typeof targetSize!=="undefined"?targetSize:3)} PLAYER DESK</p>`+`<h2>this class link is incomplete.</h2><p class="quiet">ask your friend to copy it again.<br>no new desk was opened.</p><button class="stampbtn" type="button" data-new>open your own desk</button><button class="pencil-link" type="button" data-back>back to class</button>'
		),
			(c = this.card.querySelector("[data-new]")) == null ||
				c.addEventListener("click", e),
			(d = this.card.querySelector("[data-back]")) == null ||
				d.addEventListener("click", a);
	}
	name(e, a) {
		var P;
		this.show(
			`name:${e}`,
			"" +
				`<p class="eyebrow">${typeof targetSize === "undefined" ? 3 : targetSize} PLAYER DESK</p>` +
				`<h2>who is sitting down?</h2><input class="inkfield" maxlength="12" enterkeyhint="go" autocapitalize="words" autocomplete="nickname" autocorrect="off" spellcheck="false" value="${J(e === "me" ? "" : e)}" placeholder="your name"><p class="quiet group-error">names go up on the board. you can change yours once.</p><button class="stampbtn" type="button" disabled>take a seat</button><button class="pencil-link" type="button" data-back>back to class</button>`
		);
		const c = this.card.querySelector("input"),
			d = this.card.querySelector(".stampbtn"),
			f = this.card.querySelector(".group-error"),
			p = () =>
				c.value
					.replace(/[^A-Za-z0-9 ._-]/g, "")
					.replace(/\s+/g, " ")
					.trim()
					.slice(0, 12),
			v = () => {
				d.disabled = p().length < 2;
			};
		c.addEventListener("input", v),
			d.addEventListener("click", () => {
				if (p().length < 2) {
					(f.textContent = "put a name down first."), c.focus();
					return;
				}
				(d.disabled = !0),
					d.setAttribute("aria-busy", "true"),
					(d.textContent = "taking your seat…"),
					a(p());
			}),
			(P = this.card.querySelector("[data-back]")) == null ||
				P.addEventListener("click", () => {
					this.close(), (location.href = location.pathname);
				}),
			c.addEventListener("keydown", ($) => {
				$.key === "Enter" && !d.disabled && d.click();
			}),
			v(),
			window.setTimeout(() => c.focus(), 250);
	}
	lobbyAction(e, a) {
		const c = this.card.querySelector(e);
		if (!c) {
			return;
		}
		const f =
			e === "[data-copy]"
				? {
						done: "link copied ✓",
						failed: "couldn't copy · try again",
						idle: "copy class link",
						working: "copying…",
					}
				: {
						done: "seats checked ✓",
						failed: "couldn't check · try again",
						idle: "check the seats",
						working: "checking…",
					};
		(c.textContent = f[a]),
			(c.disabled = a === "working"),
			(c.dataset.state = a),
			c.setAttribute("aria-busy", a === "working" ? "true" : "false");
	}
	lobby(e, a, c, d, f) {
		var H, B, Q, M;
		const sz = targetSize || e.targetSize || 3,
			p = N.map((G) => {
				const I = e.members.find((D) => D.seat === G),
					s = (I == null ? void 0 : I.seat) === e.mySeat,
					Y = de(G);
				return I
					? `<li class="filled" style="--player-color:${Y.css}"><span><i class="group-player-dot" aria-hidden="true"></i>${this.named(I)}${s ? '<b class="group-you">you</b>' : ""}</span><small>${Y.label} · ${J($t[I.pen].name)}</small></li>`
					: `<li style="--player-color:${Y.css}"><span><i class="group-player-dot" aria-hidden="true"></i>empty seat</span><small>${Y.label} · send the class link</small></li>`;
			}).join(""),
			v = Math.max(0, sz - e.members.length),
			P = v
				? `invite ${v} more ${v === 1 ? "friend" : "friends"}`
				: "everyone is here",
			$ = `lobby:${e.roomId}:${e.rosterRevision}:${e.members.map((G) => `${G.seat}:${G.name}:${G.pen}:${G.present}`).join("|")}`,
			q = f
				? '<button class="stampbtn" type="button" data-share>share class link</button>'
				: "",
			E = this.show(
				$,
				`<p class="eyebrow">${sz} PLAYER DESK</p><h2>${P}</h2><ol class="group-seats">${p}</ol><p class="quiet">the match starts only when all ${sz} are sitting here.<br>seats update automatically.</p><button class="stampbtn" type="button" data-copy>copy class link</button>${q}<button class="pencil-link" type="button" data-retry>check the seats</button>${d ? '<button class="pencil-link" type="button" data-leave>back to class</button>' : ""}`
			);
		this.lobbyAction("[data-copy]", this.copyState),
			this.lobbyAction("[data-retry]", this.checkState),
			E &&
				(d &&
					((H = this.card.querySelector("[data-leave]")) == null ||
						H.addEventListener("click", d)),
				(B = this.card.querySelector("[data-copy]")) == null ||
					B.addEventListener("click", async () => {
						this.copyState !== "working" &&
							((this.copyState = "working"),
							this.lobbyAction("[data-copy]", this.copyState),
							(this.copyState = (await a()) ? "done" : "failed"),
							this.lobbyAction("[data-copy]", this.copyState),
							this.copyReset !== null && window.clearTimeout(this.copyReset),
							(this.copyReset = window.setTimeout(() => {
								(this.copyState = "idle"),
									this.lobbyAction("[data-copy]", this.copyState);
							}, 2200)));
					}),
				(Q = this.card.querySelector("[data-share]")) == null ||
					Q.addEventListener("click", () => {
						f == null || f();
					}),
				(M = this.card.querySelector("[data-retry]")) == null ||
					M.addEventListener("click", async () => {
						this.checkState !== "working" &&
							((this.checkState = "working"),
							this.lobbyAction("[data-retry]", this.checkState),
							(this.checkState = (await c()) ? "done" : "failed"),
							this.lobbyAction("[data-retry]", this.checkState),
							this.checkReset !== null && window.clearTimeout(this.checkReset),
							(this.checkReset = window.setTimeout(() => {
								(this.checkState = "idle"),
									this.lobbyAction("[data-retry]", this.checkState);
							}, 1800)));
					}));
	}
	terms(e, a, c, d, f) {
		var Q, M, G;
		const p = e.members
				.map((I) => {
					const s = I.seat === e.mySeat,
						Y = de(I.seat),
						D = J($t[I.pen].name),
						ye = I.ready ? "ready" : s ? "your choice" : "choosing",
						se =
							s && d && !I.ready && !a
								? `<button class="group-change-pen" type="button" aria-label="Choose your pen. Currently ${D}">choose pen</button>`
								: "";
					return `<li class="${I.ready ? "ready" : ""}" style="--player-color:${Y.css}"><span class="group-player-name"><i class="group-player-dot" aria-hidden="true"></i>${this.named(I)}${s ? '<em class="group-you">you</em>' : ""}</span><small class="group-player-pen"><b>${Y.label}</b>${D} · ${ye}</small>${se}</li>`;
				})
				.join(""),
			v = e.members.find((I) => I.seat === e.mySeat),
			P = (v == null ? void 0 : v.ready) === !0,
			$ = P || a,
			q = P ? "ready ✓" : a ? "locking in…" : "ready",
			E = P
				? "waiting for the others…"
				: a
					? "saving your seat…"
					: "your pen stays yours.",
			H = `terms:${e.matchNo}:${e.members.map((I) => `${I.seat}:${I.name}:${I.pen}:${I.ready}`).join("|")}:${a}`;
		this.show(
			H,
			`<p class="eyebrow">FIRST TO 3 ROUNDS</p><h2>choose pens. then ready.</h2><ol class="group-seats group-terms">${p}</ol><p class="group-rule">first pen out watches · last pen left gets the point.</p><p class="quiet group-practice">practice desk · no pens change hands</p><button class="stampbtn ${$ ? "working" : ""}" type="button" data-state="${a ? "working" : P ? "done" : "idle"}" aria-busy="${a}" ${$ ? "disabled" : ""}>${q}</button><p class="quiet group-wait">${E}</p>${f ? '<button class="pencil-link" type="button" data-leave>back to class</button>' : ""}`
		) &&
			((Q = this.card.querySelector(".stampbtn")) == null ||
				Q.addEventListener("click", c),
			(M = this.card.querySelector(".group-change-pen")) == null ||
				M.addEventListener("click", d ?? (() => {})),
			f &&
				((G = this.card.querySelector("[data-leave]")) == null ||
					G.addEventListener("click", f)));
	}
	penPicker(e, a, c, d, f) {
		const p = de(e.mySeat);
		this.show(
			`pen-picker:${e.matchNo}:${a.join("|")}`,
			As({
				color: p.css,
				detail: "the colour is yours. choose the pen you earned.",
				eligible: a,
				eyebrow: `YOUR ${p.label.toUpperCase()} PEN`,
				selected: c,
			})
		) && js(this.card, c, d, f);
	}
	result(e, a, c, d, f, p, v) {
		var U, tt, we, Pe;
		const P = [
				...e.members.filter((b) => b.seat === e.mySeat),
				...e.members.filter((b) => b.seat !== e.mySeat),
			],
			$ = P.slice(1),
			q =
				((U = e.members.find((b) => b.seat === a)) == null ? void 0 : U.name) ??
				"someone",
			E = P.map((b) => c[b.seat]).join("–"),
			H =
				a === null
					? "all three went out"
					: a === e.mySeat
						? `you beat ${$.map((b) => J(b.name)).join(" and ")}<br>by ${E}`
						: `${J(q)} beat you<br>by ${E}`,
			B = e.members.find((b) => b.seat === e.mySeat),
			Q = e.members
				.filter((b) => b.ready)
				.map((b) => (b.seat === e.mySeat ? "you" : J(b.name))),
			M = d || (B == null ? void 0 : B.ready),
			G = e.members.filter((b) => b.present).length === 3,
			I = this.standings.length === 2,
			s = I
				? Math.min(...this.standings.map((b) => b.mine))
				: a === e.mySeat
					? 1
					: 0,
			Y = $.map((b) => {
				var V;
				return I
					? (((V = this.standings.find((Fe) => Fe.name === b.name)) == null
							? void 0
							: V.theirs) ?? 0)
					: a === b.seat
						? 1
						: 0;
			}),
			D =
				$.length === 2
					? `<div class="duelseries group-series">
           <p class="quiet who rematchcopy">Matches so far between you, ${J($[0].name)} and ${J($[1].name)}.</p>
           <table>
             <thead><tr><th>you</th><th>${this.named($[0])}</th><th>${this.named($[1])}</th></tr></thead>
             <tbody><tr><td>${s}</td><td>${Y[0]}</td><td>${Y[1]}</td></tr></tbody>
           </table>
         </div>`
					: "",
			ye = this.standings
				.map((b) => `${b.name}:${b.mine}-${b.theirs}`)
				.join(",");
		if (!G) {
			if (
				!this.show(
					`result:reduced:${e.matchNo}:${E}:${a}:${ye}`,
					`<h2>${H}.</h2>${D}<div class="duelresultmotion ${a === e.mySeat ? "win" : "loss"}" data-duel-result-motion aria-hidden="true"></div><p class="quiet who rematchcopy">${a === e.mySeat ? "You&rsquo;re on fire." : "Show them who is better."}</p><button class="stampbtn" type="button" data-leave>back to class</button>`
				)
			) {
				return;
			}
			const V = this.card.querySelector("[data-duel-result-motion]");
			V && (this.motionCleanup = Pn(V, a === e.mySeat)),
				(tt = this.card.querySelector("[data-leave]")) == null ||
					tt.addEventListener("click", p);
			return;
		}
		const se = (B == null ? void 0 : B.ready) === !0,
			ge = se
				? "rematch asked ✓"
				: d
					? "asking…"
					: v
						? "sign in and rematch"
						: "ask for a rematch",
			Rt = se
				? `${Q.length ? `${Q.join(", ")} ready. ` : ""}waiting for the others…`
				: d
					? "saving your rematch…"
					: "",
			Ue = `result:${e.matchNo}:${E}:${a}:${e.members.map((b) => `${b.seat}:${b.ready}`).join("|")}:${d}:${ye}`,
			ce = a === e.mySeat;
		if (
			!this.show(
				Ue,
				`<h2>${H}.</h2>${D}${se ? "" : `<div class="duelresultmotion ${ce ? "win" : "loss"}" data-duel-result-motion aria-hidden="true"></div><p class="quiet who rematchcopy">${ce ? "You&rsquo;re on fire. Ask for a rematch to keep the streak going." : "Ask for a rematch. Show them who is better."}</p>`}<button class="stampbtn" type="button" data-state="${d ? "working" : se ? "done" : "idle"}" aria-busy="${d}" ${M ? "disabled" : ""}>${ge}</button><p class="quiet group-wait">${Rt}</p><button class="pencil-link" type="button" data-leave>back to class</button>`
			)
		) {
			return;
		}
		const et = this.card.querySelector("[data-duel-result-motion]");
		et && (this.motionCleanup = Pn(et, ce)),
			(we = this.card.querySelector(".stampbtn")) == null ||
				we.addEventListener("click", v ?? f),
			(Pe = this.card.querySelector("[data-leave]")) == null ||
				Pe.addEventListener("click", p);
	}
	showing() {
		return this.wrap.classList.contains("show");
	}
	isStillPlaying() {
		return this.showing() && this.viewKey === "idle-ask";
	}
	stillPlaying(e, a) {
		var f;
		const c = this.card.querySelector("#pf-idle-left");
		if (this.showing() && c) {
			c.textContent = String(e);
			return;
		}
		this.showing() ||
			!this.show(
				"idle-ask",
				`<p class="eyebrow">YOUR TURN</p><h2>still playing?</h2><p class="quiet">you'll leave on your own in <b id="pf-idle-left">${e}</b> if you don't tap.</p><button class="stampbtn" type="button" data-stay>still here</button>`
			) ||
			(f = this.card.querySelector("[data-stay]")) == null ||
			f.addEventListener("click", (p) => {
				p.stopPropagation(), a();
			});
	}
	closeStillPlaying() {
		(this.viewKey !== "idle-ask" &&
			!this.card.querySelector("#pf-idle-left")) ||
			(this.close(), this.viewKey === "idle-ask" && (this.viewKey = ""));
	}
	dropout(e, a, c, d, f, p) {
		var q, E;
		const v = c ? "checking seat…" : a ? "continue ✓" : "continue with two",
			P = c
				? "saving your choice…"
				: a
					? `${d}/2 agreed · waiting for the other player…`
					: "if they return first, the match resumes normally.";
		this.show(
			`dropout:${e}:${a}:${c}:${d}`,
			`<p class="eyebrow">ONE SEAT IS QUIET</p><h2>${J(e)} hasn’t come back.</h2><p class="quiet">your score and this match are safe.<br>both players still here must agree to continue.</p><button class="stampbtn" type="button" data-state="${c ? "working" : a ? "done" : "idle"}" aria-busy="${c}" ${a ? "disabled" : ""}>${v}</button><p class="quiet group-wait">${P}</p><button class="pencil-link" type="button" data-leave>leave this match</button>`
		) &&
			((q = this.card.querySelector(".stampbtn")) == null ||
				q.addEventListener("click", f),
			(E = this.card.querySelector("[data-leave]")) == null ||
				E.addEventListener("click", p));
	}
	abandoned(e, a, c) {
		var d, f, p;
		this.show(
			`abandoned:${e}`,
			`<p class="eyebrow">MATCH ABANDONED</p><h2>only one player is left.</h2><p class="quiet">${J(e)} stays at the desk, but there is no match to award. no one gets a false win.</p>${zn()}<button class="pencil-link" type="button" data-back>back to class</button>`
		),
			(d = this.card.querySelector("[data-link]")) == null ||
				d.addEventListener("click", a),
			(f = this.card.querySelector("[data-find]")) == null ||
				f.addEventListener("click", c),
			(p = this.card.querySelector("[data-back]")) == null ||
				p.addEventListener("click", () => {
					this.close(), (location.href = location.pathname);
				});
	}
	error(e, a) {
		var c, d;
		this.show(
			`error:${e}`,
			"" +
				`<p class="eyebrow">${typeof targetSize === "undefined" ? 3 : targetSize} PLAYER DESK</p>` +
				`<h2>the line did not reach.</h2><p class="quiet">${J(e)}</p><button class="stampbtn" type="button">try again</button><button class="pencil-link" type="button" data-back>back to class</button>`
		),
			(c = this.card.querySelector(".stampbtn")) == null ||
				c.addEventListener("click", a),
			(d = this.card.querySelector("[data-back]")) == null ||
				d.addEventListener("click", () => {
					this.close(), (location.href = location.pathname);
				});
	}
	gone(e, a, c) {
		var d, f, p;
		this.show(
			`gone:${e}`,
			"" +
				`<p class="eyebrow">${typeof targetSize === "undefined" ? 3 : targetSize} PLAYER DESK</p>` +
				`<h2>one seat is empty.</h2><p class="quiet">${J(e)} did not come back. this match is closed, so nobody is left on a frozen desk.</p>${zn()}<button class="pencil-link" type="button" data-back>back to class</button>`
		),
			(d = this.card.querySelector("[data-link]")) == null ||
				d.addEventListener("click", a),
			(f = this.card.querySelector("[data-find]")) == null ||
				f.addEventListener("click", c),
			(p = this.card.querySelector("[data-back]")) == null ||
				p.addEventListener("click", () => {
					this.close(), (location.href = location.pathname);
				});
	}
}
const targetSize = Math.max(
	2,
	Math.min(6, Number(new URLSearchParams(location.search).get("size")) || 3)
);
const N = Array.from({ length: targetSize }, (_, i) => i),
	eo = targetSize;
function Pt(r) {
	return N[((r % N.length) + N.length) % N.length];
}
function St(r) {
	return {
		...r,
		layoutRotation: Pt(r.layoutRotation ?? r.round - 1),
		outs: [...r.outs],
		roundWinners: [...r.roundWinners],
		scores: [...r.scores],
		withdrawn: [...(r.withdrawn ?? [])],
	};
}
function en(r, e) {
	for (let a = 1; a <= N.length; a++) {
		const c = Pt(r + a);
		if (!e.has(c)) {
			return c;
		}
	}
	return null;
}
class tn {
	constructor(e, a) {
		k(this, "value");
		(this.value = a
			? St(a)
			: {
					activeSeat: 0,
					layoutRotation: 0,
					matchId: e,
					opener: 0,
					outs: [],
					phase: "aiming",
					revision: 0,
					round: 1,
					roundWinners: [],
					scores: [0, 0, 0],
					turn: 1,
					winner: null,
					withdrawn: [],
				}),
			this.assertValid();
	}
	state() {
		return St(this.value);
	}
	canShoot(e) {
		return (
			this.value.phase === "aiming" &&
			this.value.activeSeat === e &&
			!this.value.outs.includes(e)
		);
	}
	beginShot(e, a) {
		return !this.canShoot(e) || a !== this.value.turn
			? !1
			: ((this.value.phase = "settling"), this.value.revision++, !0);
	}
	cancelShot(e) {
		return this.value.phase !== "settling" ||
			e.matchId !== this.value.matchId ||
			e.phase !== "aiming" ||
			e.turn !== this.value.turn ||
			e.revision + 1 !== this.value.revision ||
			e.activeSeat !== this.value.activeSeat
			? !1
			: ((this.value = St(e)), !0);
	}
	pass(e, a) {
		if (!this.canShoot(e) || a !== this.value.turn) {
			return !1;
		}
		const c = en(e, new Set(this.value.outs));
		return c === null
			? !1
			: (this.value.turn++,
				this.value.revision++,
				(this.value.activeSeat = c),
				!0);
	}
	settle(e, a) {
		if (
			this.value.phase !== "settling" ||
			e !== this.value.turn ||
			this.value.activeSeat === null
		) {
			return { kind: "continue", state: this.state(), winner: null };
		}
		const c = new Set([...this.value.outs, ...this.value.withdrawn]);
		for (const p of a) {
			c.add(p);
		}
		(this.value.outs = N.filter((p) => c.has(p))), this.value.revision++;
		const d = N.filter((p) => !c.has(p));
		if (d.length >= 2) {
			return (
				this.value.turn++,
				(this.value.activeSeat = en(this.value.activeSeat, c)),
				(this.value.phase = "aiming"),
				{ kind: "continue", state: this.state(), winner: null }
			);
		}
		const f = d.length === 1 ? d[0] : null;
		return (
			this.value.roundWinners.push(f),
			(this.value.activeSeat = null),
			f !== null && this.value.scores[f]++,
			f !== null && this.value.scores[f] >= eo
				? ((this.value.winner = f),
					(this.value.phase = "match_end"),
					{ kind: "match_won", state: this.state(), winner: f })
				: ((this.value.phase = "round_result"),
					{
						kind: f === null ? "round_tied" : "round_won",
						state: this.state(),
						winner: f,
					})
		);
	}
	nextRound() {
		if (this.value.phase !== "round_result") {
			return !1;
		}
		const e = en(this.value.opener, new Set(this.value.withdrawn));
		return e === null
			? !1
			: (this.value.round++,
				this.value.turn++,
				(this.value.layoutRotation = Pt(this.value.layoutRotation + 1)),
				(this.value.opener = e),
				(this.value.activeSeat = this.value.opener),
				(this.value.outs = [...this.value.withdrawn]),
				(this.value.phase = "aiming"),
				this.value.revision++,
				!0);
	}
	restore(e) {
		return e.matchId !== this.value.matchId || e.revision < this.value.revision
			? !1
			: ((this.value = St(e)), this.assertValid(), !0);
	}
	assertValid() {
		const e = this.value;
		if (
			e.scores.length !== 3 ||
			e.outs.some((a) => !N.includes(a)) ||
			e.withdrawn.some((a) => !N.includes(a))
		) {
			throw new Error("invalid group state");
		}
		if (!N.includes(e.layoutRotation)) {
			throw new Error("invalid group layout");
		}
		if (e.phase === "aiming" && e.activeSeat === null) {
			throw new Error("aiming without an active seat");
		}
		if (e.activeSeat !== null && e.outs.includes(e.activeSeat)) {
			throw new Error("out player cannot be active");
		}
	}
}
const Yn_table = {
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
function Bn(r, e) {
	const sz = typeof targetSize === "undefined" ? 3 : targetSize,
		tbl = Yn_table[sz] || Yn_table[3];
	return tbl[Pt(e + r)];
}
const to = location.hostname === "localhost"
	? `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.hostname}:3002/realtime/v1/websocket`
	: "wss://penfight-realtime.penfight-api.workers.dev/realtime/v1/websocket",
	Ge = [350, 650, 1100, 1800, 3e3, 5e3],
	no = 1e4,
	so = { broadcast: { ack: !1, self: !1 }, postgres_changes: [], private: !1 };
class ao {
	constructor(e) {
		k(this, "topic");
		k(this, "socket", null);
		k(this, "joined", !1);
		k(this, "stopped", !1);
		k(this, "suspended", !1);
		k(this, "ref", 0);
		k(this, "joinRef", "");
		k(this, "reconnectAttempt", 0);
		k(this, "retryTimer", null);
		k(this, "rejoinTimer", null);
		k(this, "joinTimer", null);
		k(this, "heartbeatTimer", null);
		k(this, "heartbeatPending", !1);
		k(this, "peers", new Map());
		k(this, "pending", new Map());
		k(this, "queue", []);
		k(this, "joinedAt", 0);
		k(this, "onOnline", () => {
			var e;
			if (!(this.joined || this.stopped || this.suspended)) {
				if (
					(this.retryTimer !== null && clearTimeout(this.retryTimer),
					(this.retryTimer = null),
					(this.reconnectAttempt = 0),
					((e = this.socket) == null ? void 0 : e.readyState) ===
						WebSocket.OPEN)
				) {
					this.clearRejoin(), this.rejoin();
					return;
				}
				this.connect();
			}
		});
		(this.options = e),
			(this.topic = `realtime:${e.topic}`),
			addEventListener("online", this.onOnline),
			this.connect();
	}
	async connect() {
		if (this.stopped || this.suspended) {
			return;
		}
		this.options.onStatus(
			this.reconnectAttempt ? "reconnecting" : "connecting",
			""
		);
		let e;
		try {
			e = await this.options.accessToken();
		} catch {
			this.reconnect("identity unavailable");
			return;
		}
		if (this.stopped || this.suspended) {
			return;
		}
		const a = new WebSocket(`${to}?apikey=${encodeURIComponent(xs)}&vsn=1.0.0`);
		(this.socket = a),
			(a.onopen = () => this.pushJoin(e)),
			(a.onmessage = (c) => this.receive(c.data)),
			(a.onerror = () => {}),
			(a.onclose = (c) => {
				this.socket === a && this.reconnect(c.reason || `closed ${c.code}`);
			});
	}
	receive(e) {
		var f;
		if (typeof e != "string") {
			return;
		}
		let a;
		try {
			a = JSON.parse(e);
		} catch {
			return;
		}
		if (a.event === "phx_reply") {
			const p = a.payload;
			if (a.topic === "phoenix") {
				this.heartbeatPending = !1;
				return;
			}
			if (a.ref !== this.joinRef) {
				return;
			}
			if ((this.clearJoinWatch(), p.status !== "ok")) {
				this.options.onStatus("error", "private desk refused"),
					(f = this.socket) == null || f.close();
				return;
			}
			(this.joined = !0),
				(this.joinedAt = Date.now()),
				(this.reconnectAttempt = 0),
				this.clearRejoin(),
				this.track(),
				this.startHeartbeat();
			for (const v of this.queue.splice(0)) {
				this.raw(v);
			}
			this.options.onStatus("joined", "");
			for (const v of this.pending.values()) {
				this.schedule(v, 0);
			}
			return;
		}
		if (a.event === "presence_state") {
			this.peers.clear();
			for (const [p, v] of Object.entries(a.payload ?? {})) {
				this.peers.set(p, v.metas ?? []);
			}
			this.emitPeers();
			return;
		}
		if (a.event === "presence_diff") {
			const p = a.payload;
			for (const [v, P] of Object.entries(p.leaves ?? {})) {
				const $ = new Set((P.metas ?? []).map((E) => E.phx_ref)),
					q = (this.peers.get(v) ?? []).filter((E) => !$.has(E.phx_ref));
				q.length ? this.peers.set(v, q) : this.peers.delete(v);
			}
			for (const [v, P] of Object.entries(p.joins ?? {})) {
				const $ = this.peers.get(v) ?? [];
				for (const q of P.metas ?? []) {
					$.some((E) => E.phx_ref === q.phx_ref) || $.push(q);
				}
				this.peers.set(v, $);
			}
			this.emitPeers();
			return;
		}
		if (a.event === "phx_error" || a.event === "phx_close") {
			(this.joined = !1), this.scheduleRejoin(oo(a.payload));
			return;
		}
		if (a.event !== "broadcast") {
			return;
		}
		const c = a.payload;
		if (!(c.event && c.payload) || typeof c.payload.from != "string") {
			return;
		}
		const d = { event: c.event, from: c.payload.from, payload: c.payload };
		if (d.event === "ack") {
			const p = this.pending.get(d.payload.id);
			p &&
				(p.missing.delete(d.from),
				p.missing.size || this.clearPending(d.payload.id));
			return;
		}
		if (d.event === "pass" || d.event === "here") {
			const p = d.payload.id;
			typeof p == "string" && p && this.send("ack", { id: p });
		}
		this.options.onMessage(d);
	}
	send(e, a) {
		var d;
		const c = this.serialise(e, a);
		this.joined &&
		((d = this.socket) == null ? void 0 : d.readyState) === WebSocket.OPEN
			? this.raw(c)
			: e !== "aim" &&
				(this.queue.push(c),
				this.queue.length > 48 && this.queue.splice(0, this.queue.length - 48));
	}
	sendCritical(e, a, c) {
		const d = new Set(c.filter((f) => f !== this.options.playerId));
		if (d.size) {
			const f = { attempt: 0, event: e, missing: d, payload: a, timer: null };
			this.pending.set(a.id, f), this.schedule(f, Ge[0]);
		}
		this.send(e, a);
	}
	acknowledgeTurn(e) {
		this.send("ack", { id: e });
	}
	schedule(e, a) {
		e.timer !== null && clearTimeout(e.timer),
			(e.timer = window.setTimeout(() => {
				var c, d;
				if (
					((e.timer = null),
					!!(this.pending.has(e.payload.id) && e.missing.size))
				) {
					if (e.attempt >= Ge.length) {
						(d = (c = this.options).onDeliveryFailed) == null ||
							d.call(c, e.event, e.payload.id, [...e.missing]),
							this.clearPending(e.payload.id);
						return;
					}
					this.send(e.event, e.payload),
						e.attempt++,
						this.schedule(e, Ge[Math.min(e.attempt, Ge.length - 1)]);
				}
			}, a));
	}
	serialise(e, a) {
		return JSON.stringify({
			event: "broadcast",
			payload: {
				event: e,
				payload: { ...a, from: this.options.playerId },
				type: "broadcast",
			},
			ref: String(++this.ref),
			topic: this.topic,
		});
	}
	track() {
		this.push({
			event: "presence",
			payload: {
				event: "track",
				payload: {
					at: Date.now(),
					id: this.options.playerId,
					name: this.options.name,
					pen: this.options.pen || "reynolds045",
					seat: this.options.seat,
				},
				type: "presence",
			},
			ref: String(++this.ref),
			topic: this.topic,
		});
	}
	emitPeers() {
		const e = [];
		for (const [a, c] of this.peers) {
			if (a === this.options.playerId || !c[0]) {
				continue;
			}
			const d = c[0];
			e.push({
				at: d.at ?? Date.now(),
				id: a,
				name: d.name ?? "someone",
				pen: d.pen || "reynolds045",
				seat: d.seat ?? -1,
			});
		}
		this.options.onPeers(e);
	}
	startHeartbeat() {
		this.heartbeatTimer !== null && clearInterval(this.heartbeatTimer),
			(this.heartbeatPending = !1),
			(this.heartbeatTimer = window.setInterval(() => {
				var e;
				if (this.heartbeatPending) {
					(e = this.socket) == null || e.close();
					return;
				}
				(this.heartbeatPending = !0),
					this.push({
						event: "heartbeat",
						payload: {},
						ref: String(++this.ref),
						topic: "phoenix",
					}),
					Date.now() - this.joinedAt > 35 * 6e4 &&
						((this.joinedAt = Date.now()),
						this.options
							.accessToken()
							.then((a) => {
								this.joined &&
									this.push({
										event: "access_token",
										join_ref: this.joinRef,
										payload: { access_token: a },
										ref: String(++this.ref),
										topic: this.topic,
									});
							})
							.catch(() => {
								var a;
								return (a = this.socket) == null ? void 0 : a.close();
							}));
			}, 25e3));
	}
	pushJoin(e) {
		(this.joinRef = String(++this.ref)),
			this.push({
				event: "phx_join",
				join_ref: this.joinRef,
				payload: {
					access_token: e,
					config: {
						...so,
						presence: { enabled: !0, key: this.options.playerId },
					},
				},
				ref: this.joinRef,
				topic: this.topic,
			}),
			this.watchJoin();
	}
	watchJoin() {
		const e = this.socket;
		this.clearJoinWatch(),
			(this.joinTimer = window.setTimeout(() => {
				(this.joinTimer = null),
					!(this.joined || this.stopped || this.socket !== e) &&
						(e == null || e.close());
			}, no));
	}
	clearJoinWatch() {
		this.joinTimer !== null && clearTimeout(this.joinTimer),
			(this.joinTimer = null);
	}
	scheduleRejoin(e) {
		if (this.stopped || this.suspended || this.rejoinTimer !== null) {
			return;
		}
		const a = Ge[Math.min(this.reconnectAttempt, Ge.length - 1)],
			c = a * 0.5 + Math.random() * a;
		this.reconnectAttempt++,
			this.options.onStatus("reconnecting", e),
			(this.rejoinTimer = window.setTimeout(() => {
				var d;
				(this.rejoinTimer = null),
					!(this.stopped || this.joined) &&
						((d = this.socket) == null ? void 0 : d.readyState) ===
							WebSocket.OPEN &&
						this.rejoin();
			}, c));
	}
	async rejoin() {
		var a;
		let e;
		try {
			e = await this.options.accessToken();
		} catch {
			this.scheduleRejoin("identity unavailable");
			return;
		}
		this.stopped ||
			this.joined ||
			((a = this.socket) == null ? void 0 : a.readyState) !== WebSocket.OPEN ||
			this.pushJoin(e);
	}
	clearRejoin() {
		this.rejoinTimer !== null && clearTimeout(this.rejoinTimer),
			(this.rejoinTimer = null);
	}
	reconnect(e) {
		if (
			((this.joined = !1),
			this.heartbeatTimer !== null && clearInterval(this.heartbeatTimer),
			(this.heartbeatTimer = null),
			this.clearRejoin(),
			this.clearJoinWatch(),
			this.stopped || this.suspended || this.retryTimer !== null)
		) {
			return;
		}
		const a = Math.min(1e4, 400 * 2 ** Math.min(this.reconnectAttempt++, 5));
		this.options.onStatus("reconnecting", e),
			(this.retryTimer = window.setTimeout(() => {
				(this.retryTimer = null), this.connect();
			}, a));
	}
	push(e) {
		this.raw(JSON.stringify(e));
	}
	raw(e) {
		var a;
		((a = this.socket) == null ? void 0 : a.readyState) === WebSocket.OPEN &&
			this.socket.send(e);
	}
	clearPending(e) {
		const a = this.pending.get(e);
		a && a.timer !== null && clearTimeout(a.timer), this.pending.delete(e);
	}
	forgetPeer(e) {
		for (const [a, c] of this.pending) {
			c.missing.delete(e), c.missing.size || this.clearPending(a);
		}
	}
	shutdown(e) {
		var a;
		if (!this.stopped) {
			e && this.send("leave", { why: "left" }),
				(this.stopped = !0),
				removeEventListener("online", this.onOnline),
				this.retryTimer !== null && clearTimeout(this.retryTimer),
				this.clearRejoin(),
				this.clearJoinWatch(),
				this.heartbeatTimer !== null && clearInterval(this.heartbeatTimer);
			for (const c of [...this.pending.keys()]) {
				this.clearPending(c);
			}
			(a = this.socket) == null || a.close(),
				(this.socket = null),
				this.options.onStatus("left", "");
		}
	}
	leave() {
		this.shutdown(!0);
	}
	stop() {
		this.shutdown(!1);
	}
	suspend() {
		if (this.stopped || this.suspended) {
			return;
		}
		(this.suspended = !0),
			(this.joined = !1),
			this.retryTimer !== null && clearTimeout(this.retryTimer),
			(this.retryTimer = null),
			this.clearRejoin(),
			this.clearJoinWatch(),
			this.heartbeatTimer !== null && clearInterval(this.heartbeatTimer),
			(this.heartbeatTimer = null);
		for (const a of this.pending.values()) {
			a.timer !== null && clearTimeout(a.timer), (a.timer = null);
		}
		const e = this.socket;
		(this.socket = null), e == null || e.close();
	}
	resume() {
		this.stopped ||
			!this.suspended ||
			((this.suspended = !1), (this.reconnectAttempt = 0), this.connect());
	}
}
function oo(r) {
	if (r && typeof r == "object") {
		const e = r;
		if (typeof e.reason == "string" && e.reason) {
			return e.reason;
		}
	}
	return "desk closed";
}
const es = "pf_group_frames_v1",
	io = 24;
function ro(r) {
	if (!r || typeof r != "object") {
		return !1;
	}
	const e = r;
	return (
		typeof e.roomId == "string" &&
		Number.isInteger(e.matchNo) &&
		Number.isInteger(e.expectedRevision) &&
		typeof e.state == "object" &&
		e.state !== null &&
		Number.isInteger(e.state.revision) &&
		typeof e.pens == "object" &&
		e.pens !== null
	);
}
function an(r = localStorage) {
	try {
		const e = JSON.parse(r.getItem(es) ?? "[]");
		return Array.isArray(e)
			? e
					.filter(ro)
					.sort(
						(a, c) =>
							a.matchNo - c.matchNo || a.state.revision - c.state.revision
					)
			: [];
	} catch {
		return [];
	}
}
function ts(r, e = localStorage) {
	try {
		e.setItem(es, JSON.stringify(r.slice(-io)));
	} catch {}
}
function co(r, e = localStorage) {
	const a = an(e),
		c = (p) =>
			p.roomId === r.roomId &&
			p.matchNo === r.matchNo &&
			p.state.revision === r.state.revision,
		d = { ...r, queuedAt: Date.now() },
		f = a.findIndex(c);
	f >= 0 ? (a[f] = d) : a.push(d), ts(a, e);
}
function lo(r, e, a = localStorage) {
	return an(a).filter((c) => c.roomId === r && c.matchNo === e);
}
function Jn(r, e, a, c = localStorage) {
	ts(
		an(c).filter(
			(d) => d.roomId !== r || d.matchNo !== e || d.state.revision > a
		),
		c
	);
}
const re = N.map($e),
	Ze = 2800,
	nn = "pf_group_return_v1";
function Xe() {
	var r;
	return (
		((r = crypto.randomUUID) == null ? void 0 : r.call(crypto)) ??
		`${Date.now()}-${Math.random().toString(36).slice(2)}`
	);
}
function uo() {
	var e;
	const r = Qn;
	if (r.desk.depth < r.desk.width) {
		const a = r.desk.width;
		(r.desk.width = r.desk.depth), (r.desk.depth = a);
	}
	targetSize > 3
		? ((r.desk.width = 0.92), (r.desk.depth = 0.7))
		: (r.desk.width = 0.46),
		(r.input.maxPullViewportRatio = 0.31),
		(r.input.jMax = 0.0205),
		(r.desk.friction = 0.45),
		(r.pen.friction = 0.36),
		(e = window.matchMedia) != null &&
			e.call(window, "(pointer: coarse)").matches &&
			(r.pen.selectionRadius = 0.042);
}
function _t(r) {
	return Object.fromEntries(
		re.map((e) => {
			const a = r[e].body;
			return [e, Da(a.translation(), a.rotation())];
		})
	);
}
const Hn = (r) => r instanceof L && r.code === "22023";
async function fo(r = null) {
	document.body.classList.add("group-mode");
	const e = new Xa();
	Os();
	const a = (t) => {
		const n = Cn(t.userId),
			o = xn(t.userId);
		if (!(n.length || o)) {
			return "";
		}
		const i = { champion: o, name: t.name, trophies: n };
		return ca(`group:${t.userId}`, i), la(i, 20, `group:${t.userId}`);
	};
	e.setMarks(a);
	const c = new Ls();
	Ua(c), Ms();
	let d = Qt();
	r &&
		(await new Promise((t) => {
			const n = () => {
				c.close(), (d = Qt()), t();
			};
			if (r.outcome.do === "ask" && r.here && r.theirs) {
				const o = Gs(
						{ progress: r.here.progress, revision: r.hereRevision },
						{ progress: r.theirs.progress, revision: r.outcome.revision }
					),
					i = (h) => {
						fe("attendance_choice", { pick: h }),
							Ta("login", { intent: r.intent, pick: h }),
							Pa(h, r).then((m) => {
								if (m.error) {
									c.attendanceTrouble(m.error, n, () => n());
									return;
								}
								h === "mine" && m.adopted && Rn(m.adopted, vt()), n();
							});
					},
					u = () =>
						c.attendanceTwo(r.here, r.theirs, o, (h) => {
							if (!(h !== "theirs" && h !== "mine")) {
								if (o !== "same" && h !== o) {
									const m = h === "mine" ? "this phone" : "your account",
										y = o === "mine" ? "this phone" : "your account";
									c.attendanceBehind(m, y, (S) => {
										S === "overwrite" ? i(h) : u();
									});
									return;
								}
								i(h);
							}
						});
				u();
				return;
			}
			if (r.outcome.do === "shared" || r.error) {
				c.attendanceTrouble(
					r.error ?? "this game already belongs to another account.",
					n,
					() => n()
				);
				return;
			}
			r.outcome.do === "adopt"
				? fe("attendance_restored", {
						matches: d.matchesPlayed,
						pens: d.owned.length,
					})
				: Rn(d, vt()),
				n();
		})),
		uo(),
		Ds(),
		Us({ furthest: 0, matches: d.matchesPlayed, pensOwned: Fs(d).length });
	const f = new URLSearchParams(location.search),
		p = Ws(f.get("group"));
	if (p.kind === "invalid") {
		e.invalidInvite(
			() => {
				location.href = `${location.pathname}?group=new`;
			},
			() => {
				location.href = location.pathname;
			}
		);
		return;
	}
	const v = p.kind === "create",
		P = p.kind === "join" ? p.code : Wa(),
		$ = !Ks(P);
	let q = $;
	const E = () => (q ? Promise.resolve() : ((q = !0), Ra(!0).catch(() => {})));
	let H = null,
		B = !1,
		Q = null;
	if ((r == null ? void 0 : r.intent) === "multiplayer" && p.kind === "join") {
		try {
			const t = sessionStorage.getItem(nn),
				n = t ? JSON.parse(t) : null;
			typeof (n == null ? void 0 : n.roomId) == "string" &&
				n.code === P &&
				((H = n.roomId),
				(B = r.intent === "multiplayer" && n.rematch === !0),
				(Q = typeof n.matchNo == "number" ? n.matchNo : null));
		} catch {}
	}
	let M = d.name.trim();
	if (M === "me" || M.length < 2) {
		const t = performance.now();
		z("name_prompt", { mode: "group" }),
			(M = await new Promise((n) => e.name("", n))),
			z("name_set", {
				len: M.length,
				mode: "group",
				secs: Math.round((performance.now() - t) / 1e3),
			}),
			(d.name = M),
			Nn(d);
	}
	let G = !1;
	e.opening(!v, () => {
		(G = !0), e.close(), (location.href = location.pathname);
	});
	const I = window.setTimeout(() => e.openingSlow(!v), 6e3);
	let s;
	let myRoomUid = "";
	try {
		const sk = "pf_room_user_" + P;
		myRoomUid = sessionStorage.getItem(sk);
		if (!myRoomUid) {
			myRoomUid = "u_" + Math.random().toString(36).slice(2, 10);
			sessionStorage.setItem(sk, myRoomUid);
		}
	} catch {
		myRoomUid = "u_" + Math.random().toString(36).slice(2, 10);
	}
	const makePeerRoom = (pen, isHost) => ({
		code: P,
		dropVotes: [],
		matchNo: 1,
		members: [
			{
				name: M,
				pen,
				present: true,
				ready: true,
				seat: isHost ? 0 : 1,
				userId: myRoomUid,
			},
		],
		mySeat: isHost ? 0 : 1,
		pens: null,
		roomId: `pf_${P}`,
		rosterRevision: 1,
		state: null,
		status: "waiting",
		targetSize,
		topic: `room:${P}`,
		transitionOwnerUserId: myRoomUid,
		userId: myRoomUid,
	});
	const Y = async (t) => {
		if (targetSize === 3) {
			try {
				return await (v ? Ka(P, M, t) : H ? kt(H) : za(P, M, t));
			} catch (e) {
				console.warn("Using realtime fallback", e);
			}
		}
		return makePeerRoom(t, v);
	};
	try {
		if (
			((s = await Y(Me(d)).catch((t) => {
				if (!(Hn(t) && bt(Me(d)))) {
					throw t;
				}
				return Zt(null), Y(d.equipped);
			})),
			G)
		) {
			return;
		}
		if (H) {
			try {
				sessionStorage.removeItem(nn);
			} catch {}
		}
		v &&
			history.replaceState(
				null,
				"",
				(() => {
					const u = new URL(En(location.origin, location.pathname, s.code));
					targetSize !== 3 && u.searchParams.set("size", String(targetSize));
					return u.toString();
				})()
			),
			z("group_open", { create: v, room: s.roomId }),
			!(v || H) && zs("group");
	} catch (t) {
		const n = t instanceof Error ? t.message : "the desk could not open";
		z("group_room_failed", {
			create: v,
			reason: t instanceof L ? t.code : "unknown",
		}),
			e.error(n, () => location.reload());
		return;
	} finally {
		window.clearTimeout(I);
	}
	let D = !1;
	const ye = () => {
			Ga(s.roomId);
			try {
				sessionStorage.setItem(
					nn,
					JSON.stringify({
						code: s.code,
						matchNo: s.matchNo,
						rematch: !0,
						roomId: s.roomId,
					})
				);
			} catch {}
		},
		se = async () => {
			if (D) {
				return;
			}
			D = !0;
			const t = Ln(),
				n = On(t),
				o = Ca(navigator.userAgent, window.__pfNative);
			if (
				(fe("attendance_started", { state: n, surface: "multiplayer" }),
				await xa("multiplayer", vt(), Qt()))
			) {
				(D = !1), location.reload();
				return;
			}
			const u = n === "lapsed" || n === "blocked" ? null : vt(),
				h = await Un("multiplayer", u, t.email);
			if (h.failure === "ticket" || ((h.failure || !h.url) && !o)) {
				(D = !1),
					e.error(
						"Google would not open. Try again in a moment.",
						() => void se()
					);
				return;
			}
			if (o) {
				const m = () => {
					(D = !1), c.close();
				};
				c.attendance(
					{
						blocked: n === "blocked",
						email: t.email,
						embedded: qa(navigator.userAgent, !!window.__pfNative),
						lapsed: n === "lapsed",
						oauthUrl: h.url,
						offerApple: !0,
						present: !1,
						restoring: !1,
					},
					m,
					(y) => {
						if (y === "present") {
							ye(), c.signingIn();
							return;
						}
						if (y === "apple") {
							fe("attendance_started", {
								method: "apple",
								state: n,
								surface: "multiplayer",
							}),
								c.signingIn(),
								(async () => {
									const S = await Un("multiplayer", u, t.email, "apple");
									if (!S.url || S.failure) {
										(D = !1),
											c.attendanceTrouble(
												S.failure === "ticket"
													? "could not start. wait a moment and try again."
													: "apple would not open. try again in a moment.",
												m,
												(R) => {
													R === "retry" ? se() : m();
												}
											);
										return;
									}
									ye(), location.assign(S.url);
								})();
							return;
						}
						m();
					}
				);
				return;
			}
			if (!h.url) {
				(D = !1),
					e.error(
						"Google would not open. Try again in a moment.",
						() => void se()
					);
				return;
			}
			ye(), (location.href = h.url);
		},
		ge = () =>
			On(Ln()) === "present"
				? void 0
				: () => {
						se();
					},
		Rt = () => {
			var t;
			return (
				((t = s.members.find((n) => n.userId !== s.userId)) == null
					? void 0
					: t.name) ?? ""
			);
		},
		Ue = (t) => ja($, t, Rt());
	function ce(t, n, o, i, u, h) {
		Sa($), e.result(s, t, n, o, Ue(i), Ue(u), h ? Ue(h) : void 0);
	}
	Bs({
		mode: () => "3 PLAYER",
		show: (t) => {
			const n = t ? s.mySeat : (N.find((i) => i !== s.mySeat) ?? s.mySeat),
				o = N.map((i) => (i === n ? 3 : 0));
			ce(
				n,
				o,
				!1,
				() => {},
				() => e.close(),
				ge()
			);
		},
	});
	const C = Qn,
		et = document.fonts.load('24px "Patrick Hand"').catch(() => []),
		U = await Js.create(C);
	await Promise.race([et, new Promise((t) => setTimeout(t, 1200))]), Hs(U, C);
	const tt = document.getElementById("app"),
		{ renderer: we, scene: Pe } = Ys();
	Vs(tt, we.domElement), fe("boot_ready", { mode: "group" }), Qs();
	const b = Zs(),
		V = new Xs(!0),
		Fe = ea(Pe, C, V),
		w = new ta(C.present.cueMs),
		Z = new ua(),
		Nt = document.createElement("div");
	Nt.className = "topbtns";
	const ns = na(Z, we.domElement),
		ss = new sa(Pe),
		X = new ka(U),
		T = {},
		ve = {};
	let on = "",
		l = null,
		ae = 0,
		We = null,
		Et = !1,
		Ce = null,
		ee = null,
		Ke = null,
		nt = null,
		he = null,
		be = null,
		ke = null,
		At = !1,
		le = null,
		ue = null,
		Se = !1,
		st = null,
		F = !1,
		at = null,
		jt = Promise.resolve(),
		Ct = !1,
		te = !1,
		rn = -1,
		xt = performance.now(),
		xe = performance.now(),
		ze = -1,
		qt = -1,
		j = !1,
		ot = !1,
		_e = 0,
		it = -1,
		Ot = -1,
		oe = null,
		Lt = !1,
		Mt = !1,
		cn = 0;
	const ln = performance.now();
	let un = 0,
		rt = !1,
		W = !1,
		ct = !1,
		qe = new Set(),
		lt = -1,
		dn = -1,
		Oe = !1,
		ut = 0;
	const hn = new Set(),
		as = 8e3,
		Re = (t) => s.members.find((n) => n.seat === t),
		dt = () => s.members.filter((t) => t.present),
		ht = () => dt().map((t) => t.userId),
		Gt = () => {
			const t = s.members.find((n) => n.userId === s.transitionOwnerUserId);
			return (t == null ? void 0 : t.seat) === s.mySeat ? s.mySeat : null;
		},
		Ne = (t) => {
			var n;
			return t === s.mySeat
				? "you"
				: (((n = Re(t)) == null ? void 0 : n.name) ?? "someone");
		},
		Ie = () =>
			rt ? dt().filter((t) => t.userId !== s.userId && !qe.has(t.userId)) : [],
		pn = () => {
			le !== null && clearTimeout(le),
				(le = null),
				ue !== null && clearTimeout(ue),
				(ue = null);
		};
	let Be = () => {};
	const ne = () => {
			if (te) {
				w.releaseCue();
				return;
			}
			const t = Ie();
			if (W && t.length) {
				const n = t.map((o) => o.name).join(" and ");
				w.holdCue(
					`${n} ${t.length === 1 ? "is" : "are"} reconnecting · seat saved`,
					"↻"
				);
				return;
			}
			if (Et) {
				w.holdCue("getting that turn across", "↻");
				return;
			}
			if (j) {
				const n = s.members.find(
						(u) => u.present && !u.ready && u.userId !== s.userId
					),
					o = l == null ? void 0 : l.state().activeSeat,
					i = (n == null ? void 0 : n.name) ?? (o == null ? "they" : Ne(o));
				w.holdCue(`${i} seems away. confirming.`, "…");
				return;
			}
			w.releaseCue();
		},
		mn = () => {
			da(b, C), b.updateMatrixWorld(!0);
			const { w: t, h: n } = ha();
			we.setSize(t, n);
			const o = new pa();
			o.set(0, 0, 0).project(b),
				w.setAnchor(((o.x + 1) / 2) * t, ((1 - o.y) / 2) * n);
			const i = C.desk.width / 2,
				u = C.desk.depth / 2;
			let h = 1 / 0,
				m = -1 / 0,
				y = -1 / 0,
				S = 1 / 0;
			for (const [R, A] of [
				[-i, -u],
				[i, -u],
				[-i, u],
				[i, u],
			]) {
				o.set(R, 0, A).project(b);
				const O = ((o.x + 1) / 2) * t,
					g = ((1 - o.y) / 2) * n;
				(h = Math.min(h, O)),
					(m = Math.max(m, O)),
					A > 0 ? (y = Math.max(y, g)) : (S = Math.min(S, g));
			}
			ma(Fe, b, C, n),
				o.set(0, Fe.boardBottomY, Fe.boardZ).project(b),
				w.setDeskRect({
					board: ((1 - o.y) / 2) * n,
					far: S,
					left: h,
					near: y,
					right: m,
				});
		};
	mn();
	const fn = new Set(),
		yn = () => {
			const t = s.members.map((n) => n.userId).filter((n) => !fn.has(n));
			if (t.length) {
				for (const n of t) {
					fn.add(n);
				}
				ba(t).then(() => {
					e.refreshMarks(s.members), pt();
				});
			}
		},
		pt = () => {
			(V.groupNames = N.map((o) => {
				var i;
				return `${de(o).label} · ${((i = Re(o)) == null ? void 0 : i.name) ?? "empty"}`;
			})),
				V.clearHonours(),
				N.forEach((o, i) => {
					const u = Re(o);
					u &&
						V.setHonour(
							`seat${i}`,
							V.groupNames[i],
							Cn(u.userId).length,
							xn(u.userId)
						);
				});
			const t = l == null ? void 0 : l.state();
			V.groupOuts = (t == null ? void 0 : t.outs) ?? [];
			const n = (t == null ? void 0 : t.scores) ?? [0, 0, 0];
			V.drawGroup(n);
		},
		Dt = () => {
			var o;
			const t = N.map((i) => {
					var u;
					return ((u = Re(i)) == null ? void 0 : u.pen) ?? "reynolds045";
				}),
				n = t.join("|");
			if (n !== on) {
				for (const i of re) {
					T[i] && U.world.removeRigidBody(T[i].body),
						(o = ve[i]) == null || o.dispose();
				}
				U.tracked.length = 0;
				for (const i of N) {
					const u = $e(i),
						h = ga($t[t[i]]),
						m = Bn((l == null ? void 0 : l.state().layoutRotation) ?? 0, i);
					(T[u] = wa(
						U,
						C,
						u,
						{ x: m.x, y: h.radius + 5e-4, z: m.z },
						m.yaw,
						h
					)),
						U.track(T[u].body);
					const y = de(i);
					(ve[u] = new va(Pe, T[u], h.id, { color: y.three })),
						ve[u].setOwnerMarked(i === s.mySeat);
				}
				U.snapTransforms(), (on = n);
			}
		},
		os = async () => {
			const t = await qn();
			z("rivals_open", {
				mode: "group",
				n: (t == null ? void 0 : t.length) ?? -1,
			}),
				c.rivalries(
					(t ?? []).map((n) => ({
						bouts: n.bouts,
						lastAt: n.last_at,
						mine: n.my_wins,
						myBest: n.my_best_streak,
						name: n.their_name,
						ran: n.they_ran,
						streakLen: n.streak_len,
						streakMine: n.streak_mine,
						theirBest: n.their_best_streak,
						theirs: n.their_wins,
					})),
					t === null,
					() => {}
				);
		},
		is = async (t) => {
			const n = await qn();
			if (!n) {
				return;
			}
			const o = s.members.filter((i) => i.userId !== s.userId);
			o.length &&
				(e.setStandings(
					o.map((i) => {
						const u = n.find((h) => h.them === i.userId);
						return {
							mine: (u == null ? void 0 : u.my_wins) ?? 0,
							name: i.name,
							theirs: (u == null ? void 0 : u.their_wins) ?? 0,
						};
					})
				),
				t());
		},
		rs = () => {
			if (X.active) {
				Z.setSlideLevel((X.motionLevel - 0.06) / 1.4);
				return;
			}
			let t = 0;
			for (const n of re) {
				if (!T[n]) {
					continue;
				}
				const o = T[n].body.translation();
				if (o.y < -0.02 || o.y > 0.02) {
					continue;
				}
				const i = T[n].body.linvel();
				t = Math.max(t, (Math.hypot(i.x, i.z) - 0.06) / 1.4);
			}
			Z.setSlideLevel(t);
		},
		Ut = () => {
			if (!l) {
				return;
			}
			const t = l.state(),
				n = new Set(t.withdrawn);
			for (const o of N) {
				const i = $e(o),
					u = Bn(t.layoutRotation, o);
				T[i].body.setEnabled(!n.has(o)),
					Ea(T[i], { x: u.x, y: T[i].radius + 5e-4, z: u.z }, u.yaw),
					(ve[i].group.visible = !n.has(o));
			}
			U.snapTransforms(),
				(ut = performance.now() + 1800),
				w.showCue(`round ${t.round} · ${Ne(t.opener)} opens`, "✎");
		},
		mt = (t) => {
			for (const n of re) {
				const o = t[n];
				o && Na(T[n], o);
			}
			U.snapTransforms();
		},
		ie = () => {
			if (!l) {
				return;
			}
			const t = l.state();
			if (
				(t.turn !== rn && ((rn = t.turn), (xt = performance.now()), (j = !1)),
				pt(),
				W && !Ie().length && (W = !1),
				W)
			) {
				const n = Ie()
					.map((o) => o.name)
					.join(" and ");
				w.setTurn(`waiting for ${n}`, !1, "↻"), ne();
				return;
			}
			if (t.phase === "aiming" && t.activeSeat !== null) {
				const n = t.activeSeat === s.mySeat,
					o = de(t.activeSeat),
					i = t.outs.includes(s.mySeat),
					u = n ? "your turn" : `${Ne(t.activeSeat)}'s turn`;
				w.setTurn(
					`${o.label} · ${u}${i ? " · you are watching" : ""}`,
					n,
					n ? "✎" : "·"
				);
			} else {
				w.clearTurn();
			}
			ne();
		},
		Je = (t, n, o = !1) => {
			const i = (l == null ? void 0 : l.state().round) ?? null;
			o || !l || l.state().matchId !== t.matchId
				? (l = new tn(t.matchId, t))
				: l.restore(t),
				(ae = Math.max(ae, t.revision)),
				n && mt(n);
			const u = new Set(l.state().withdrawn),
				h = new Set(l.state().outs);
			for (const m of N) {
				const y = $e(m);
				T[y].body.setEnabled(!(h.has(m) || u.has(m))),
					(ve[y].group.visible = !u.has(m));
			}
			i !== null && t.round !== i && (ut = performance.now() + 1800), ie();
		},
		Ft = async () => {
			var t, n;
			for (const o of lo(s.roomId, s.matchNo)) {
				try {
					const i = await Ja(o);
					s = i;
					const u =
						((t = i.state) == null ? void 0 : t.revision) ?? o.state.revision;
					(ae = Math.max(ae, u)), Jn(o.roomId, o.matchNo, u), (Ct = !1);
				} catch (i) {
					const u = i instanceof L ? i.code : "network";
					fe("rpc_failed", {
						fn: "group_commit_frame_v1",
						match: s.matchNo,
						room: s.roomId,
						status: u,
					});
					try {
						const h = await kt(s.roomId);
						s = h;
						const m =
							h.matchNo === o.matchNo
								? (((n = h.state) == null ? void 0 : n.revision) ?? -1)
								: Number.MAX_SAFE_INTEGER;
						if (m >= o.state.revision) {
							Jn(o.roomId, o.matchNo, m), (ae = Math.max(ae, m));
							continue;
						}
					} catch {}
					Ct ||
						((Ct = !0),
						w.showCue("the score is saving in the background.", "↻"));
					return;
				}
			}
		},
		gn = (t, n) => {
			co({
				expectedRevision: ae,
				matchNo: s.matchNo,
				pens: n,
				roomId: s.roomId,
				state: t,
			}),
				(jt = jt.then(Ft));
		},
		cs = (t) => {
			ee !== null && clearTimeout(ee);
			const n = () => {
				if (
					((ee = null), (Ke = null), !l || l.state().phase !== "round_result")
				) {
					return;
				}
				l.nextRound(), Ut(), ie();
				const o = l.state(),
					i = _t(T);
				s.mySeat === t && (x.send("sync", { pens: i, state: o }), gn(o, i));
			};
			(Ke = performance.now() + Ze), (nt = t), (ee = window.setTimeout(n, Ze));
		},
		ls = (t, n) => {
			if (n.phase !== "aiming") {
				return;
			}
			const o = n.outs.filter((m) => !t.includes(m));
			if (!o.length) {
				return;
			}
			const i = o.map((m) => {
					var y;
					return m === s.mySeat
						? "your pen"
						: (((y = Re(m)) == null ? void 0 : y.name) ?? "one pen");
				}),
				u = n.activeSeat,
				h =
					u === null
						? ""
						: ` · ${de(u).label} · ${u === s.mySeat ? "your turn" : `${Ne(u)}'s turn`}`;
			w.flashTurn(
				`${i.join(" and ")} ${o.length === 1 ? "is" : "are"} out${h}`,
				"×",
				1800
			);
		},
		He = (t, n) => {
			if (lt === n.revision) {
				return;
			}
			lt = n.revision;
			const o = n.scores.join("–");
			if (n.phase === "match_end") {
				Aa("group", `${s.roomId}:${s.matchNo}`, {
					match: s.matchNo,
					names: s.members.map((S) => S.name),
					room: s.roomId,
					scores: [...n.scores],
					winner: n.winner,
					won: n.winner === s.mySeat,
				}),
					z("group_match_end", {
						match: s.matchNo,
						scores: n.scores.join("-"),
						won: n.winner === s.mySeat,
					}),
					w.setPlaying(!1),
					yt(!1);
				const h = n.winner,
					m = h === s.mySeat ? "YOU" : Ne(h ?? 0).toUpperCase();
				w.showResult(
					`${m} WIN${h === s.mySeat ? "" : "S"} THE MATCH · ${o}`,
					Ze
				),
					Z.duckAmbience(4200),
					window.setTimeout(() => Z.matchBell(), 260),
					window.setTimeout(
						() => (h === s.mySeat ? Z.cheer() : Z.boo()),
						h === s.mySeat ? 900 : 700
					),
					he !== null && clearTimeout(he);
				const y = () =>
					ce(
						h,
						n.scores,
						!1,
						() => {
							pe();
						},
						() => {
							K();
						},
						ge()
					);
				he = window.setTimeout(() => {
					(he = null), y(), is(y);
				}, Ze - 150);
				return;
			}
			const i = n.roundWinners[n.roundWinners.length - 1],
				u =
					i === null
						? `ROUND ${n.round} DRAW · ${o}`
						: `${i === s.mySeat ? "YOU" : Ne(i).toUpperCase()} WIN${i === s.mySeat ? "" : "S"} ROUND ${n.round} · ${o}`;
			z("group_round", {
				draw: i === null,
				round: n.round,
				won: i === s.mySeat,
			}),
				w.showResult(u, Ze),
				t !== null && cs(t);
		},
		Ye = (t) => {
			st = t.userId;
			const n = s.dropVotes.filter((i) => i.targetUserId === t.userId),
				o = n.some((i) => i.reporterUserId === s.userId) || Se;
			e.dropout(
				t.name,
				o,
				Se,
				n.length,
				() => void us(t),
				() => void K()
			);
		},
		us = async (t) => {
			var n;
			if (!(Se || !t.present)) {
				(Se = !0), Ye(t);
				try {
					const o = await Kn(s.roomId, s.matchNo, t.userId);
					(Se = !1),
						Ae(o),
						((n = o.members.find((u) => u.userId === t.userId)) == null
							? void 0
							: n.present) && Ye(t);
				} catch {
					(Se = !1),
						Ye(t),
						w.showCue("could not check that seat. try once more.", "↻");
				}
			}
		},
		Le = new Set(),
		ds = (t) =>
			t.outs
				.map((n) => re.indexOf(n))
				.filter((n) => n === 0 || n === 1 || n === 2),
		hs = (t) => Object.fromEntries(re.map((n) => [n, t.final[n]])),
		wn = (t, n) => {
			try {
				return (
					X.start({
						onComplete: n,
						onEvent: (o) => {
							o.kind === "pen-hit"
								? Z.clack(o.strength)
								: o.kind === "floor-hit"
									? Z.floorThud(o.strength)
									: o.kind === "desk-hit" && Z.deskTap(o.strength);
						},
						package: t,
						pens: T,
						startedAt: performance.now(),
					}),
					!0
				);
			} catch {
				return !1;
			}
		},
		ps = (t) =>
			t instanceof L &&
			["22023", "40001", "42501", "P0001", "invalid"].includes(t.code),
		vn = (t, n, o) => {
			var h;
			const i = hs(t.package);
			(s = {
				...s,
				pens: i,
				state: t.state,
				status: t.state.phase === "match_end" ? "ended" : "playing",
				transitionOwnerUserId:
					((h = Re(n)) == null ? void 0 : h.userId) ?? null,
			}),
				(ae = t.revision),
				Je(t.state, i),
				ls(o, t.state),
				(t.state.phase === "round_result" || t.state.phase === "match_end") &&
					He(n, t.state);
			const u = Ce;
			(Ce = null),
				u &&
					u.state &&
					u.state.revision > t.revision &&
					window.setTimeout(() => Ae(u), 0);
		},
		ms = (t, n) => {
			if (
				!l ||
				t.package.bout !== s.matchNo ||
				t.package.penOrder.length !== 3 ||
				!re.every((m) => t.package.penOrder.includes(m))
			) {
				return !1;
			}
			const o = l.state(),
				i = re.indexOf(t.package.shooterId);
			if (
				(i !== 0 && i !== 1 && i !== 2) ||
				t.package.baseRevision !== o.revision ||
				t.package.turn !== o.turn ||
				o.activeSeat !== i ||
				!l.beginShot(i, o.turn)
			) {
				return !1;
			}
			const u = o.outs;
			return wn(t.package, () => vn(t, i, u))
				? (Le.add(t.commandId),
					Le.size > 32 && Le.delete(Le.values().next().value),
					(ae = t.revision),
					n && x.acknowledgeTurn(n),
					ie(),
					!0)
				: (l.cancelShot(o), !1);
		},
		ft = (t, n) => {
			if (t && Le.has(t.commandId)) {
				return x.acknowledgeTurn(t.id), Promise.resolve();
			}
			if (We || !l || X.active || l.state().phase === "settling") {
				return We ?? Promise.resolve();
			}
			const o = s.matchNo,
				i = l.state().revision;
			return (
				(We = (async () => {
					try {
						const u = await Ya({
							afterRevision: i,
							matchNo: o,
							roomId: s.roomId,
						});
						if (!l || s.matchNo !== o || X.active) {
							return;
						}
						const h = u.find(
							(m) => m.package.baseRevision === l.state().revision
						);
						if (h) {
							const m =
								(t == null ? void 0 : t.commandId) === h.commandId &&
								t.revision === h.revision &&
								t.turn === h.turn;
							ms(h, m ? t.id : void 0);
							return;
						}
						if (n != null && n.state && n.state.revision > l.state().revision) {
							const m = l.state().phase;
							Je(n.state, n.pens),
								(n.state.phase === "round_result" ||
									n.state.phase === "match_end") &&
									m !== n.state.phase &&
									He(Gt(), n.state);
						}
					} catch {
						n && (Ce = n);
					}
					kn();
				})().finally(() => {
					We = null;
				})),
				We
			);
		},
		bn = async (t, n, o, i) => {
			let u = !1,
				h = null;
			const m = () => {
				u && h && vn(h, s.mySeat, o.outs);
			};
			if (
				!wn(t, () => {
					(u = !0), m();
				})
			) {
				l == null || l.cancelShot(o);
				return;
			}
			const y = window.setTimeout(() => {
					(Et = !0), ne();
				}, 1e3),
				S = [0, 350, 700, 1400, 2500, 5e3];
			let R = 0,
				A = null;
			const O = (g) => {
				X.cancel(), mt(i), l == null || l.cancelShot(o), ie();
				const _ = g instanceof L ? g.code : "network";
				fe("rpc_failed", {
					fn: "group_commit_turn_v2",
					match: s.matchNo,
					room: s.roomId,
					status: _,
				}),
					console.error("group turn commit failed", _, g);
				const Vt = location.hostname === "localhost" ? ` (${_})` : "";
				w.flashTurn(
					`that turn did not reach the desk${Vt}. try again`,
					"↻",
					3e3
				),
					_ === "40001" && me();
			};
			try {
				for (
					Ma({
						bout: t.bout,
						extra: { previous: o, result: n, startFrame: i },
						package: t,
						roomId: s.roomId,
					});
					R < S.length && !te && s.matchNo === t.bout && s.status === "playing";
				) {
					const g = S[Math.min(R, S.length - 1)];
					g && (await new Promise((_) => window.setTimeout(_, g)));
					try {
						(h = await Ha({
							matchNo: s.matchNo,
							package: t,
							roomId: s.roomId,
							state: n,
						})),
							(ae = h.revision),
							Qe(),
							x.sendCritical(
								"turn",
								{
									commandId: h.commandId,
									id: t.commandId,
									matchNo: s.matchNo,
									revision: h.revision,
									turn: h.turn,
								},
								ht()
							),
							m();
						return;
					} catch (_) {
						if (((A = _), ps(_))) {
							Qe(), O(_);
							return;
						}
						R++;
					}
				}
				A && !te && s.matchNo === t.bout && s.status === "playing" && O(A);
			} finally {
				window.clearTimeout(y), (Et = !1), ne();
			}
		},
		kn = () => {
			const t = $a();
			if (!t || t.roomId !== s.roomId || t.bout !== s.matchNo) {
				t && Qe();
				return;
			}
			const n = t.extra;
			if (!(n != null && n.result && n.previous && n.startFrame && l)) {
				Qe();
				return;
			}
			if (t.package.baseRevision !== l.state().revision) {
				Qe();
				return;
			}
			bn(t.package, n.result, n.previous, n.startFrame);
		};
	const updatePeerRoster = (peerList) => {
		if (!(peerList && peerList.length)) {
			return;
		}
		const rosterMap = new Map();
		const myPen = Me(d) || "reynolds045";
		const myEntry = s.members.find((m) => m.userId === s.userId) || {
			name: M,
			pen: myPen,
			present: true,
			ready: true,
			seat: s.mySeat,
			userId: s.userId,
		};
		rosterMap.set(s.userId, myEntry);
		peerList.forEach((peer) => {
			const pId = String(peer.id || peer.userId);
			if (!pId || pId === s.userId) {
				return;
			}
			let seat =
				typeof peer.seat === "number" &&
				peer.seat >= 0 &&
				peer.seat < targetSize
					? peer.seat
					: -1;
			if (
				seat < 0 ||
				seat === s.mySeat ||
				[...rosterMap.values()].some((m) => m.seat === seat)
			) {
				for (let slot = 0; slot < targetSize; slot++) {
					if (
						slot !== s.mySeat &&
						![...rosterMap.values()].some((m) => m.seat === slot)
					) {
						seat = slot;
						break;
					}
				}
			}
			rosterMap.set(pId, {
				name: String(peer.name || "friend"),
				pen: String(peer.pen || "reynolds045"),
				present: true,
				ready: peer.ready !== false,
				seat: seat >= 0 ? seat : rosterMap.size,
				userId: pId,
			});
		});
		const updatedMembers = [...rosterMap.values()].sort(
			(a, b) => a.seat - b.seat
		);
		const changed =
			updatedMembers.length !== s.members.length ||
			updatedMembers.some(
				(m, idx) =>
					!s.members[idx] ||
					s.members[idx].userId !== m.userId ||
					s.members[idx].seat !== m.seat
			);
		if (changed) {
			s.members = updatedMembers;
			s.rosterRevision = (s.rosterRevision || 0) + 1;
			try {
				localStorage.setItem(
					"pf_roster_" + s.code,
					JSON.stringify(updatedMembers)
				);
			} catch {}
			try {
				bc && bc.postMessage({ members: updatedMembers, type: "roster_sync" });
			} catch {}
			try {
				x && x.send && x.send("roster_sync", { members: updatedMembers });
			} catch {}
			Ae({ ...s });
		}
	};
	const bc =
		typeof BroadcastChannel === "undefined"
			? null
			: new BroadcastChannel("pf_group_" + s.code);
	if (bc) {
		bc.onmessage = (ev) => {
			if (ev.data) {
				if (ev.data.type === "peer_join") {
					updatePeerRoster([
						{
							id: ev.data.userId,
							name: ev.data.name,
							pen: ev.data.pen,
							seat: ev.data.seat,
						},
					]);
				} else if (
					ev.data.type === "roster_sync" &&
					Array.isArray(ev.data.members)
				) {
					updatePeerRoster(
						ev.data.members.map((m) => ({
							id: m.userId,
							name: m.name,
							pen: m.pen,
							seat: m.seat,
						}))
					);
				}
			}
		};
	}
	// Sync via localStorage across tabs on same origin
	try {
		const localRosterKey = "pf_roster_" + s.code;
		window.addEventListener("storage", (ev) => {
			if (ev.key === localRosterKey && ev.newValue) {
				try {
					const st = JSON.parse(ev.newValue);
					if (Array.isArray(st)) {
						updatePeerRoster(
							st.map((m) => ({
								id: m.userId,
								name: m.name,
								pen: m.pen,
								seat: m.seat,
							}))
						);
					}
				} catch {}
			}
		});
		const existingRaw = localStorage.getItem(localRosterKey);
		if (existingRaw) {
			try {
				const st = JSON.parse(existingRaw);
				if (Array.isArray(st) && st.length > 0) {
					// Guest claims first open seat not in st
					if (!v) {
						for (let slot = 0; slot < targetSize; slot++) {
							if (!st.some((m) => m.seat === slot)) {
								s.mySeat = slot;
								break;
							}
						}
					}
					updatePeerRoster(
						st.map((m) => ({
							id: m.userId,
							name: m.name,
							pen: m.pen,
							seat: m.seat,
						}))
					);
				}
			} catch {}
		}
		localStorage.setItem(localRosterKey, JSON.stringify(s.members));
	} catch {}
	const fs = (t) => {
			if (t.from !== s.userId && t.event !== "aim" && t.event !== "away") {
				if (t.event === "peer_join" || t.event === "roster_announce") {
					const p = t.payload;
					if (p && p.userId && p.userId !== s.userId) {
						updatePeerRoster([
							{ id: p.userId, name: p.name, pen: p.pen, seat: p.seat },
						]);
					}
					return;
				}
				if (
					t.event === "roster_sync" &&
					t.payload &&
					Array.isArray(t.payload.members)
				) {
					const inc = t.payload.members;
					const meM = inc.find((m) => m.userId === s.userId);
					if (meM && typeof meM.seat === "number" && meM.seat !== s.mySeat) {
						s.mySeat = meM.seat;
					}
					Ae({
						...s,
						members: inc,
						rosterRevision: (s.rosterRevision || 0) + 1,
					});
					return;
				}
				if (t.event === "turn") {
					ft(t.payload);
					return;
				}
				if (t.event === "pass") {
					if (hn.has(t.payload.id)) {
						return;
					}
					hn.add(t.payload.id),
						Je(t.payload.state, t.payload.pens),
						w.flashTurn("too slow. turn moved on", "💤");
					return;
				}
				if (t.event === "sync") {
					l &&
						t.payload.state.revision > l.state().revision &&
						ft(void 0, { ...s, pens: t.payload.pens, state: t.payload.state });
					return;
				}
				if (t.event === "reaction") {
					const n = fa(t.payload.what);
					n && w.showReaction(n, !0);
					return;
				}
				if (t.event === "here") {
					Kt(Number(t.payload.turn), t.from), me();
					return;
				}
				if (t.event === "leave") {
					const n = s.members.find((o) => o.userId === t.from);
					if (
						((j = !1), e.closeStillPlaying(), Be(t.from), s.status === "ended")
					) {
						Wt(t.from, n == null ? void 0 : n.name);
						return;
					}
					s.status === "playing"
						? w.showCue(
								`${(n == null ? void 0 : n.name) ?? "one player"} left · keeping this match going.`,
								"↻"
							)
						: w.showCue(
								`${(n == null ? void 0 : n.name) ?? "one player"} left`
							),
						me();
					return;
				}
				if (
					t.event === "sync_request" &&
					l &&
					!X.active &&
					l.state().phase !== "settling"
				) {
					const n = s.members
						.filter(
							(o) =>
								o.userId !== t.from &&
								(o.userId === s.userId || qe.has(o.userId))
						)
						.sort((o, i) => o.seat - i.seat)[0];
					(n == null ? void 0 : n.userId) === s.userId &&
						x.send("sync", { pens: _t(T), state: l.state() });
				}
			}
		},
		x = new ao({
			accessToken: () => aa(s.roomId),
			name: M,
			onDeliveryFailed: (t) => {
				t !== "here" && w.showCue("one desk is catching up.", "↻");
			},
			onMessage: fs,
			onPeers: (t) => {
				pn();
				const n = new Set(t.map((u) => u.id)),
					o = n.size !== qe.size || [...n].some((u) => !qe.has(u));
				(qe = n), (rt = !0);
				if (t && t.length) {
					updatePeerRoster(t);
				}
				o && me();
				const i = Ie();
				if (!l || te) {
					ct = i.length > 0;
					return;
				}
				if (i.length) {
					(ct = !0),
						(le = window.setTimeout(() => {
							(le = null), Ie().length && ((W = !0), ie());
						}, 1800)),
						i.length === 1 &&
							(ue = window.setTimeout(() => {
								ue = null;
								const u = Ie();
								u.length === 1 && ((W = !0), Ye(u[0]), ie());
							}, as));
				} else {
					const u = ct || W;
					(ct = !1),
						(W = !1),
						st && e.close(),
						(st = null),
						(Se = !1),
						ie(),
						u &&
							(w.showCue("everyone is back.", "✓"),
							x.send("sync_request", { at: Date.now() }));
				}
			},
			onStatus: (t) => {
				if (
					(t === "reconnecting" &&
						w.showCue("reconnecting. the desk is still here.", "↻"),
					t === "joined")
				) {
					const n = (l == null ? void 0 : l.state().turn) ?? s.matchNo;
					x.sendCritical("here", { id: Xe(), turn: n }, ht()),
						x.send("peer_join", {
							name: M,
							pen: Me(d) || "reynolds045",
							seat: s.mySeat,
							userId: s.userId,
						}),
						bc &&
							bc.postMessage({
								name: M,
								pen: Me(d) || "reynolds045",
								seat: s.mySeat,
								type: "peer_join",
								userId: s.userId,
							}),
						(() => {
							try {
								localStorage.setItem(
									"pf_roster_" + s.code,
									JSON.stringify(s.members)
								);
							} catch {}
						})(),
						Kt(),
						Qa(s.roomId)
							.then(Ae)
							.catch(() => {}),
						l && x.send("sync_request", { at: Date.now() });
				}
			},
			pen: Me(d) || "reynolds045",
			playerId: s.userId,
			seat: s.mySeat,
			topic: s.topic,
		});
	Be = (t) => {
		qe.delete(t), x.forgetPeer(t);
	};
	const Ve = document.createElement("div");
	Ve.className = "reactbar";
	const yt = (t) => {
			Ve.classList.toggle("on", t),
				document.body.classList.toggle("reactrow", t);
		},
		Sn = () => {
			Ve.replaceChildren();
			for (const t of ya(s.roomId, s.matchNo)) {
				const n = document.createElement("button");
				(n.type = "button"),
					(n.className = t.kind === "fixed" ? "reactpick big" : "reactpick"),
					(n.textContent = t.face),
					n.setAttribute("aria-label", `say ${t.accessibleName}`),
					n.addEventListener("click", (o) => {
						o.stopPropagation();
						const i = Date.now();
						i - un < 700 ||
							((un = i),
							x.send("reaction", { what: t.id }),
							w.showReaction(t.face, !1));
					}),
					Ve.appendChild(n);
			}
		};
	Sn(), document.body.appendChild(Ve);
	const gt = document.createElement("button");
	(gt.className = "boardbtn"),
		(gt.textContent = "rivals"),
		gt.addEventListener("click", () => void os()),
		Nt.append(gt, ns),
		document.body.appendChild(Nt);
	const Wt = (t, n) => {
		if (te) {
			return;
		}
		oe !== null && (clearInterval(oe), (oe = null));
		const o = s.members.find((i) => i.userId === t);
		z("group_abandon", {
			match: s.matchNo,
			reason: "dissolved",
			seat: (o == null ? void 0 : o.seat) ?? -1,
		}),
			(te = !0),
			le !== null && clearTimeout(le),
			(le = null),
			ue !== null && clearTimeout(ue),
			(ue = null),
			w.setPlaying(!1),
			yt(!1),
			E(),
			e.gone(
				n ?? (o == null ? void 0 : o.name) ?? "your friend",
				() => {
					location.href = `${location.pathname}?group=new`;
				},
				() => {
					location.href = `${location.pathname}?find=3`;
				}
			);
	};
	Dt(), pt(), yn();
	const ys = new oa(
			we.domElement,
			b,
			T,
			C,
			(t, n) => {
				if (!l || t !== $e(s.mySeat)) {
					return;
				}
				const o = l.state();
				if (!l.beginShot(s.mySeat, o.turn)) {
					return;
				}
				(xe = performance.now()), e.closeStillPlaying(), (j = !1);
				const i = _t(T);
				try {
					const u = Oa(
							re.map((y, S) => ({
								enabled: !(o.outs.includes(S) || o.withdrawn.includes(S)),
								id: y,
								spec: T[y].spec,
								state: La(T[y]),
							})),
							t,
							n,
							C,
							{
								baseRevision: o.revision,
								bout: s.matchNo,
								commandId: Xe(),
								turn: o.turn,
							}
						),
						m = new tn(o.matchId, l.state()).settle(o.turn, ds(u));
					bn(u, m.state, o, i);
				} catch {
					l.cancelShot(o),
						mt(i),
						w.flashTurn("could not take that shot. try again", "↻", 2400);
					return;
				}
				if ((Z.snap(n.power), !Mt)) {
					Mt = !0;
					const u = localStorage.getItem("pf_first_shot") !== "1";
					localStorage.setItem("pf_first_shot", "1"),
						fe("first_shot", {
							first: u,
							mode: "group",
							secs: Math.round((performance.now() - cn) / 1e3),
						});
				}
				fe("group_shot", {
					full_pull_px: Math.round(n.fullPullPx ?? 0),
					match: s.matchNo,
					power: Number(n.power.toFixed(3)),
					pull_px: Math.round(n.pullPx ?? 0),
					room: s.roomId,
					seat: s.mySeat,
					turn: o.turn,
				}),
					ie();
			},
			(t) =>
				!(te || W) &&
				!!(l != null && l.canShoot(s.mySeat)) &&
				t === $e(s.mySeat),
			(t) => {
				const n = Number(t.slice(5));
				w.showCue(`${de(n).label} · ${Ne(n)} · ${T[t].spec.name}`, "✋");
			},
			ia
		),
		_n = () => {
			var n;
			const t = (
				((n = s.members.find((o) => o.seat === s.mySeat)) == null
					? void 0
					: n.name) ?? d.name
			).toLowerCase();
			return {
				text: `${t} wants to play pen fight with you.
${targetSize} player match. open the link now to join, it starts when all ${targetSize} are in.`,
				title: "pen fight",
				url: (() => {
					const u = new URL(En(location.origin, location.pathname, s.code));
					targetSize !== 3 && u.searchParams.set("size", String(targetSize));
					return u.toString();
				})(),
			};
		},
		gs = async () => {
			var i;
			const t = _n(),
				n = `${t.text}
${t.url}`;
			let o = !1;
			try {
				const u = (i = navigator.clipboard) == null ? void 0 : i.writeText(n);
				if (!u) {
					throw new Error("clipboard unavailable");
				}
				await Promise.race([
					u,
					new Promise((h, m) =>
						window.setTimeout(() => m(new Error("clipboard timed out")), 1800)
					),
				]),
					(o = !0);
			} catch {}
			if (!o) {
				const u = document.createElement("textarea");
				(u.value = n),
					u.setAttribute("readonly", ""),
					(u.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0"),
					document.body.appendChild(u),
					u.select();
				try {
					o = document.execCommand("copy");
				} catch {
					o = !1;
				} finally {
					u.remove();
				}
			}
			return z("group_invite_copy", { ok: o }), o;
		},
		ws = async () => {
			if (!An(jn())) {
				return;
			}
			const t = _n(),
				n = await _a(t, Ia(navigator, window.__pfNative));
			n !== "cancelled" && z("group_invite_share", { result: n });
		},
		vs = () => {
			xe = performance.now();
		},
		Kt = (t, n) => {
			var i;
			const o = performance.now();
			if (
				((_e = o),
				(xt = o),
				(xe = o),
				(ze = -1),
				(qt = (l == null ? void 0 : l.state().turn) ?? s.matchNo),
				(Ot = s.matchNo),
				(j = !1),
				e.closeStillPlaying(),
				ne(),
				n && n !== s.userId)
			) {
				const u = (
					((i = s.members.find((h) => h.userId === n)) == null
						? void 0
						: i.name) ?? "they"
				).toLowerCase();
				w.showCue(`${u} confirmed they're there`);
			}
		},
		In = () => {
			const t = (l == null ? void 0 : l.state().turn) ?? s.matchNo;
			x.sendCritical("here", { id: Xe(), turn: t }, ht()),
				Kt(),
				s.status !== "playing" && bs();
		},
		bs = () => {
			const t = (l == null ? void 0 : l.state()) ?? s.state;
			if (
				s.status === "ended" ||
				(t == null ? void 0 : t.phase) === "match_end"
			) {
				ce(
					(t == null ? void 0 : t.winner) ?? null,
					(t == null ? void 0 : t.scores) ?? [0, 0, 0],
					F,
					() => {
						pe();
					},
					() => {
						K();
					},
					ge()
				);
				return;
			}
			const n = Xt(d),
				o = s.members.find((i) => i.seat === s.mySeat);
			e.terms(
				s,
				F,
				() => void pe(),
				n.length > 1 && !(o != null && o.ready) ? Ee : void 0,
				() => void K()
			);
		},
		zt = () => {
			oe !== null && (clearInterval(oe), (oe = null));
		},
		$n = (t) => {
			if (te || ot || s.status === "playing" || s.status === "closed") {
				return (_e = 0), zt(), !1;
			}
			const n = s.members.filter((g) => g.present);
			if (n.length < 3) {
				return (_e = 0), zt(), !1;
			}
			const o = n.find((g) => g.userId === s.userId),
				i = n.filter((g) => g.userId !== s.userId),
				u = !!(o != null && o.ready) || F,
				h = !u && i.some((g) => g.ready),
				m = u && i.some((g) => !g.ready);
			if (!(h || m)) {
				return (_e = 0), zt(), j && ((j = !1), ne()), e.closeStillPlaying(), !1;
			}
			_e || (_e = t),
				oe === null &&
					(oe = window.setInterval(() => $n(performance.now()), 1e3));
			const y = t - _e,
				S = h ? t - xe : y,
				R = Fn(y, S),
				A = s.matchNo;
			if (h) {
				return (
					j && ((j = !1), ne()),
					R === "kick" && it !== A && Ot !== A
						? ((it = A), (ot = !0), e.closeStillPlaying(), K())
						: R === "warn" || (e.isStillPlaying() && Ot !== A)
							? (e.showing() && !e.isStillPlaying() && e.close(),
								e.stillPlaying(Mn(y), In))
							: e.closeStillPlaying(),
					!0
				);
			}
			e.closeStillPlaying();
			const O = R === "warn" || R === "kick";
			if ((O !== j && ((j = O), ne()), R === "kick" && it !== A)) {
				it = A;
				const g = i.find((_) => !_.ready);
				g &&
					((j = !1),
					ne(),
					Be(g.userId),
					w.showCue(`${g.name} left · nobody pressed ready.`, "↻"),
					me());
			}
			return !0;
		},
		ks = () => {
			const t = l == null ? void 0 : l.state(),
				n =
					(t == null ? void 0 : t.activeSeat) == null ? null : Re(t.activeSeat);
			(j = !1),
				e.closeStillPlaying(),
				n && Be(n.userId),
				w.showCue(
					`${(n == null ? void 0 : n.name) ?? "one player"} left · keeping this match going.`,
					"↻"
				),
				(async () => {
					var i;
					if (n && n.userId !== s.userId) {
						try {
							Ae(await Kn(s.roomId, s.matchNo, n.userId));
						} catch {}
					}
					await me(),
						n &&
							((i = s.members.find((u) => u.userId === n.userId)) == null
								? void 0
								: i.present) &&
							!te &&
							s.status === "playing" &&
							Ye(n);
				})();
		},
		K = async () => {
			oe !== null && (clearInterval(oe), (oe = null)),
				e.close(),
				z("group_leave", { match: s.matchNo, status: s.status }),
				x.leave(),
				await Promise.all([Va(s.roomId).catch(() => {}), E()]),
				(location.href = location.pathname);
		},
		Ee = () => {
			const t = s.members.find((o) => o.seat === s.mySeat),
				n = Xt(d);
			F ||
				(t != null && t.ready) ||
				n.length < 2 ||
				((Oe = !0),
				e.penPicker(
					s,
					n,
					Me(d),
					(o) => {
						(Oe = !1),
							Zt(bt(o) ? o : null),
							bt(o) || (d.equipped = o),
							Nn(d),
							(s = {
								...s,
								members: s.members.map((i) =>
									i.seat === s.mySeat ? { ...i, pen: o } : i
								),
							}),
							e.terms(
								s,
								F,
								() => void pe(),
								Ee,
								() => void K()
							);
					},
					() => {
						(Oe = !1),
							e.terms(
								s,
								F,
								() => void pe(),
								Ee,
								() => void K()
							);
					}
				));
		},
		pe = async () => {
			if (F) {
				return;
			}
			(F = !0),
				(_e = performance.now()),
				x.sendCritical("here", { id: Xe(), turn: s.matchNo }, ht());
			const t =
				(l == null ? void 0 : l.state().phase) === "match_end" ||
				s.status === "ended";
			if (t) {
				const i = (l == null ? void 0 : l.state()) ?? s.state;
				ce(
					(i == null ? void 0 : i.winner) ?? null,
					(i == null ? void 0 : i.scores) ?? [0, 0, 0],
					!0,
					() => {},
					() => {
						K();
					},
					ge()
				);
			} else {
				e.terms(
					s,
					!0,
					() => {},
					Ee,
					() => void K()
				);
			}
			const n = [0, 500, 900, 1600, 2800];
			for (let i = 0; i < n.length; i++) {
				n[i] &&
					(w.showCue("ready is retrying.", "↻"),
					await new Promise((u) => window.setTimeout(u, n[i])));
				try {
					if (t && (await jt, (s = await kt(s.roomId)), s.status !== "ended")) {
						throw new Error("the score is still being put on the board");
					}
					(s = await Ba(s.roomId, s.matchNo, Me(d))),
						x.send("here", { id: Xe(), turn: s.matchNo }),
						(F = !1),
						z("group_ready", {
							match: s.matchNo,
							rematch: t,
							wait_s: Math.round((performance.now() - ln) / 1e3),
						}),
						Ae(s);
					return;
				} catch (u) {
					Hn(u) && bt(Me(d)) && Zt(null);
				}
			}
			F = !1;
			const o = () => void pe();
			if (t) {
				const i = (l == null ? void 0 : l.state()) ?? s.state;
				ce(
					(i == null ? void 0 : i.winner) ?? null,
					(i == null ? void 0 : i.scores) ?? [0, 0, 0],
					!1,
					o,
					() => {
						K();
					},
					ge()
				);
			} else {
				e.terms(s, !1, o, Ee, () => void K());
			}
			w.showCue("the line is slow. tap ready once more.", "↻");
		},
		Ss = () => {
			if (!s.state) {
				return;
			}
			if (
				((Oe = !1),
				he !== null && clearTimeout(he),
				(he = null),
				(lt = -1),
				(l = new tn(s.state.matchId, s.state)),
				(ae = s.state.revision),
				X.cancel(),
				(Ce = null),
				Le.clear(),
				Dt(),
				s.pens)
			) {
				mt(s.pens);
				const o = new Set([...l.state().outs, ...l.state().withdrawn]);
				for (const i of N) {
					const u = $e(i);
					T[u].body.setEnabled(!o.has(i)),
						(ve[u].group.visible = !l.state().withdrawn.includes(i));
				}
			} else {
				Ut();
			}
			e.close(!0),
				w.setPlaying(!0),
				Fa(),
				(Lt = !1),
				(Mt = !1),
				(cn = performance.now()),
				z("group_match_start", {
					match: s.matchNo,
					match_id: s.state.matchId,
					wait_s: Math.round((performance.now() - ln) / 1e3),
				}),
				(W = rt && Ie().length > 0),
				ie();
			const t = de(s.mySeat),
				n = l.state().opener;
			(ut = performance.now() + 1800),
				w.showCue(`${t.label} is your pen · ${de(n).label} opens.`, "✎"),
				Sn(),
				yt(!0),
				l.state().phase === "round_result" && He(Gt(), l.state()),
				Ft();
		};
	function Ae(t) {
		var m, y, S, R, A, O;
		const n = s,
			o = s.status === "playing",
			i = (l == null ? void 0 : l.state()) ?? null;
		(s = t), yn();
		const u = s.members.find((g) => g.seat === s.mySeat);
		s.status !== "playing" &&
			!(u != null && u.ready) &&
			!F &&
			(s = {
				...s,
				members: s.members.map((g) =>
					g.seat === s.mySeat ? { ...g, pen: Me(d) } : g
				),
			}),
			u != null && u.ready && (Oe = !1);
		const h = n.members.filter(
			(g) =>
				g.present && s.members.some((_) => _.userId === g.userId && !_.present)
		);
		if ((Dt(), pt(), s.status === "closed")) {
			const g = dt();
			g.length === 1
				? ((te = !0),
					(W = !1),
					w.setPlaying(!1),
					w.releaseCue(),
					w.clearTurn(),
					yt(!1),
					z("group_abandon", {
						match: s.matchNo,
						reason: "closed",
						seat: ((m = h[0]) == null ? void 0 : m.seat) ?? -1,
					}),
					e.abandoned(
						g[0].name,
						() => {
							location.href = `${location.pathname}?group=new`;
						},
						() => {
							location.href = `${location.pathname}?find=3`;
						}
					))
				: Wt(
						(y = h[0]) == null ? void 0 : y.userId,
						(S = h[0]) == null ? void 0 : S.name
					);
			return;
		}
		if (s.status === "playing" && s.state) {
			if (
				(!(o && l) || l.state().matchId !== s.state.matchId
					? Ss()
					: h.length
						? (Je(s.state, s.pens, !0),
							s.state.phase === "round_result" &&
								(i == null ? void 0 : i.phase) !== "round_result" &&
								He(Gt(), s.state))
						: s.state.revision > l.state().revision &&
							(X.active || l.state().phase === "settling"
								? (Ce = s)
								: ft(void 0, s)),
				h.length)
			) {
				for (const g of h) {
					Be(g.userId);
				}
				pn(),
					(W = rt && Ie().length > 0),
					(st = null),
					(Se = !1),
					e.close(),
					s.state.phase === "aiming" &&
						w.showResult(
							`${h.map((g) => g.name.toUpperCase()).join(" & ")} LEFT · ${dt().length} PLAYERS CONTINUE`,
							2400
						),
					ie();
			}
			return;
		}
		if (s.status === "ended" && s.state) {
			if (
				s.members.filter((_) => _.present).length < 3 &&
				s.members.some((_) => _.ready)
			) {
				Wt(
					(R = h[0]) == null ? void 0 : R.userId,
					(A = h[0]) == null ? void 0 : A.name
				);
				return;
			}
			if (l && (X.active || l.state().phase === "settling")) {
				Ce = s;
				return;
			}
			if (l && s.state.revision > l.state().revision) {
				ft(void 0, s);
				return;
			}
			if (
				B &&
				Q === s.matchNo &&
				!F &&
				!((O = s.members.find((_) => _.userId === s.userId)) != null && O.ready)
			) {
				(B = !1), (Q = null), pe();
				return;
			}
			if (e.isStillPlaying()) {
				return;
			}
			Je(s.state, s.pens),
				i
					? i.phase !== "match_end" && He(null, s.state)
					: ((lt = s.state.revision),
						ce(
							s.state.winner,
							s.state.scores,
							F,
							() => {
								pe();
							},
							() => {
								K();
							},
							ge()
						));
			return;
		}
		if (s.members.length >= targetSize) {
			if (e.isStillPlaying()) {
				return;
			}
			const g = Xt(d),
				_ = s.members.find((Vt) => Vt.seat === s.mySeat);
			if (Oe && !(_ != null && _.ready)) {
				return;
			}
			g.length > 1 && !(_ != null && _.ready) && !F && dn !== s.matchNo
				? ((dn = s.matchNo), Ee())
				: e.terms(
						s,
						F,
						() => void pe(),
						g.length > 1 ? Ee : void 0,
						() => void K()
					);
		} else {
			e.lobby(s, gs, me, () => void K(), An(jn()) ? ws : void 0);
		}
	}
	const me = () => {
		const t = async () => {
				try {
					return Ae(await kt(s.roomId)), await Ft(), !0;
				} catch {
					return !1;
				}
			},
			o = (at ?? Promise.resolve(!0)).then(t, t);
		return (
			(at = o),
			o.finally(() => {
				at === o && (at = null);
			}),
			o
		);
	};
	Ae(s);
	const Bt = () => {
		be !== null && clearTimeout(be),
			(be = window.setTimeout(async () => {
				await me(), Bt();
			}, 15e3));
	};
	Bt();
	let Jt = performance.now(),
		je = 0,
		wt = 0,
		Ht = "",
		Tn = !1;
	const Yt = (t) => {
		_s.tick();
		const n = Math.min(250, t - Jt);
		(Jt = t), Z.setRoomHeard(w.matchOn && !e.showing()), (je += n / 1e3);
		let o = 0;
		if (X.active) {
			je = 0;
		} else {
			while (je >= C.sim.dt && o < C.sim.maxSubSteps) {
				U.step(), U.drainCollisions(() => {}), (je -= C.sim.dt), o++;
			}
			o === C.sim.maxSubSteps && (je = 0);
		}
		X.update(t), rs();
		const i = je / C.sim.dt;
		for (let y = 0; y < re.length; y++) {
			ve[re[y]].sync(U.tracked[y], i);
		}
		const u = ys.getAim();
		if (
			(u && (xe = t),
			!Lt &&
				u &&
				l != null &&
				l.canShoot(s.mySeat) &&
				((Lt = !0), z("first_aim", { mode: "group" })),
			ss.update(u, T, C),
			!$n(t))
		) {
			if (
				!(te || W || ot) &&
				(l == null ? void 0 : l.state().phase) === "aiming" &&
				l.state().activeSeat !== null
			) {
				const y = l.state(),
					S = y.activeSeat === s.mySeat,
					R = t - xt,
					A = S ? t - xe : R,
					O = Fn(R, A);
				if (S) {
					j && ((j = !1), ne()),
						O === "kick" && ze !== y.turn && qt !== y.turn
							? ((ze = y.turn), (ot = !0), e.closeStillPlaying(), K())
							: O === "warn" || (e.isStillPlaying() && qt !== y.turn)
								? e.stillPlaying(Mn(R), In)
								: e.closeStillPlaying();
				} else {
					e.closeStillPlaying();
					const g = O === "warn" || O === "kick";
					g !== j && ((j = g), ne()),
						O === "kick" && ze !== y.turn && ((ze = y.turn), ks());
				}
			} else {
				(l != null && l.canShoot(s.mySeat)) ||
					(e.closeStillPlaying(),
					j &&
						(W || te || (l == null ? void 0 : l.state().phase) !== "aiming") &&
						((j = !1), ne()));
			}
		}
		for (const y of N) {
			const S = $e(y),
				R =
					!W && l != null && l.canShoot(y) && !(y === s.mySeat && u)
						? Gn(t)
						: 0,
				A = y === s.mySeat && t < ut ? Gn(t) : 0;
			ve[S].setPulse(Math.max(R, A));
		}
		we.render(Pe, b);
		const h = l == null ? void 0 : l.state(),
			m = h ? `${h.phase}:${h.turn}:${h.revision}` : "";
		Tn ? m && m !== Ht && ((Ht = m), Dn()) : ((Tn = !0), (Ht = m), Dn()),
			(wt = requestAnimationFrame(Yt));
	};
	(wt = requestAnimationFrame(Yt)),
		addEventListener("pointerdown", vs, { capture: !0 });
	const _s = ra(mn);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			cancelAnimationFrame(wt),
				be !== null && clearTimeout(be),
				(be = null),
				ee !== null && (clearTimeout(ee), (ee = null)),
				ke === null &&
					(ke = window.setTimeout(() => {
						(ke = null), document.hidden && ((At = !0), x.suspend());
					}, 6e4));
		} else if (
			(ke !== null && clearTimeout(ke),
			(ke = null),
			At && ((At = !1), x.resume()),
			(Jt = performance.now()),
			(je = 0),
			(wt = requestAnimationFrame(Yt)),
			me(),
			Bt(),
			kn(),
			Ke !== null && nt !== null && ee === null)
		) {
			const t = Math.max(0, Ke - performance.now()),
				n = nt;
			ee = window.setTimeout(() => {
				if (
					((ee = null),
					(Ke = null),
					(nt = null),
					!l || l.state().phase !== "round_result")
				) {
					return;
				}
				l.nextRound(), Ut(), ie();
				const o = l.state(),
					i = _t(T);
				s.mySeat === n && (x.send("sync", { pens: i, state: o }), gn(o, i));
			}, t);
		}
	}),
		addEventListener("pageshow", (t) => {
			t.persisted && location.reload();
		}),
		addEventListener("pagehide", () => {
			be !== null && clearTimeout(be),
				ke !== null && clearTimeout(ke),
				le !== null && clearTimeout(le),
				ue !== null && clearTimeout(ue),
				ee !== null && clearTimeout(ee),
				he !== null && clearTimeout(he),
				x.stop();
		});
}
export { fo as bootGroup };
