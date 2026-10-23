var ce = Object.defineProperty;
var he = (r, t, s) =>
	t in r
		? ce(r, t, { configurable: !0, enumerable: !0, value: s, writable: !0 })
		: (r[t] = s);
var w = (r, t, s) => he(r, typeof t == "symbol" ? t : t + "", s);
import {
	bn as _,
	bb as _t,
	ba as At,
	b3 as bt,
	bW as de,
	bT as dt,
	b8 as et,
	b1 as gt,
	bd as j,
	bg as jt,
	bp as kt,
	by as le,
	bX as Mt,
	bR as R,
	bB as St,
	bc as Tt,
	bG as ue,
	bU as vt,
	b9 as wt,
	bS as X,
	bV as Xt,
	bA as Yt,
	V as y,
	bm as yt,
} from "./main-pfd2.js";
import "./index-pfd2.js";
const fe = ["slap", "spin", "stand", "skid", "roll", "toss"],
	J = (r) => Math.min(1, Math.max(0, r)),
	Ft = (r) => r * r * (3 - 2 * r);
function it(r) {
	const t = (e, n, i) => Math.PI * e * e * n * i,
		s =
			1e3 *
			(t(r.radius, r.length, r.density) +
				(r.capLoad
					? t(r.capLoad.radius, r.capLoad.halfLength * 2, r.capLoad.density)
					: 0) +
				(r.midLoad
					? t(r.midLoad.radius, r.midLoad.halfLength * 2, r.midLoad.density)
					: 0));
	return {
		halfLen: r.length / 2,
		heavy: J((s - 9) / 13),
		hex: r.shape === "hex",
		long: J((r.length - 0.12) / 0.06),
		metal: !!r.capLoad,
		radius: r.radius,
		springy: J((r.restitution - 0.12) / 0.45),
		tri: r.shape === "tri",
	};
}
const Rt = new y(1, 0, 0),
	Q = new y(0, 1, 0),
	ut = new y(0, 0, 1),
	xt = new R(),
	zt = new y(),
	D = new y(),
	$ = new y(),
	G = new y();
function ot(r, t, s, e, n) {
	const i = (1 - e) * (1 - e),
		o = 2 * e * (1 - e),
		a = e * e;
	return n.set(
		i * r.x + o * t.x + a * s.x,
		i * r.y + o * t.y + a * s.y,
		i * r.z + o * t.z + a * s.z
	);
}
function E(r, t, s, e, n) {
	const i = r.halfLen;
	e.set(t * (-i + i * Math.cos(s)), (i - r.radius) * Math.sin(s), 0),
		n.setFromAxisAngle(ut, t * s);
}
const tt = 32;
function Z(r, t, s) {
	const e = {};
	let n = 0,
		i = 0;
	switch (r) {
		case "slap":
			(n = 0.28), (i = n + 0.3);
			break;
		case "spin": {
			n = 0.38;
			const o = 0.55 + 0.25 * (1 - t.heavy) - 0.12 * t.long,
				a = tt * n + (tt * o) / 2;
			(e.S = o),
				(e.A = a),
				(e.total = 2 * Math.PI * Math.max(2, Math.round(a / (2 * Math.PI)))),
				(i = n + o);
			break;
		}
		case "stand": {
			(n = 0.34),
				(e.B = 0.12),
				(e.W = 0.26 + 0.14 * (1 - t.heavy)),
				(e.Tt = 0.2 - 0.05 * t.heavy),
				(e.E = n + e.B + e.W + e.Tt),
				(i = e.E + 0.25);
			break;
		}
		case "skid": {
			(n = 0.34),
				(e.S = 0.3 + 0.14 * (1 - t.heavy)),
				(e.D = 0.12),
				(e.ov = 0.014 * (1 - t.heavy)),
				(i = n + e.S + 0.14);
			break;
		}
		case "roll": {
			if (((n = 0.44), t.tri)) {
				(e.D = 0.075), (e.steps = 6), (e.total = e.steps * ((2 * Math.PI) / 3));
				let o = 0;
				for (let a = 0; a < e.steps; a++) {
					o += 0.055 * (1 + 0.4 * a);
				}
				e.R = o;
			} else {
				(e.D = 0.22),
					(e.R = 0.55),
					(e.total =
						2 *
						Math.PI *
						Math.max(2, Math.round(e.D / t.radius / (2 * Math.PI))));
			}
			i = n + e.R + 0.08;
			break;
		}
		case "place":
			(n = 0.3), (i = n + 0.22);
			break;
		case "lower":
			(n = 0.62), (i = n + 0.12);
			break;
		case "set":
			(n = 0.3), (i = n + 0.2);
			break;
		case "lay":
			(n = 0.62), (i = n + 0.12);
			break;
		case "toss": {
			(n = 0.56),
				(e.turns = 2),
				(e.phiL = 1),
				(e.B = 0.07),
				(e.Tt = 0.17),
				(e.E = n + e.B + e.Tt),
				(i = e.E + 0.25);
			break;
		}
	}
	return { b: t, c: e, done: i, kind: r, land: n, lat: s };
}
function pe(r, t) {
	const s = r.c.steps;
	let e = 0;
	for (let n = 0; n < s; n++) {
		const i = 0.055 * (1 + 0.4 * n);
		if (t < e + i) {
			return { frac: (t - e) / i, i: n };
		}
		e += i;
	}
	return { frac: 1, i: s - 1 };
}
function Bt(r, t, s) {
	const { b: e, lat: n, c: i } = r,
		o = s.pos.set(0, 0, 0),
		a = s.quat.identity();
	if (((s.visible = t >= 0), t < 0 || t >= r.done)) {
		return s;
	}
	const l = r.land;
	switch (r.kind) {
		case "slap": {
			if (t < l) {
				const h = t / l;
				o.set(0, 1 * (1 - h * h), 0),
					a.setFromAxisAngle(ut, n * 0.14 * (1 - h));
			} else {
				const h = t - l,
					u = 0.006 * (1 - e.heavy) * (0.4 + e.springy);
				o.set(
					0,
					u * Math.abs(Math.sin((Math.PI * h) / 0.1)) * Math.exp(-h / 0.07),
					0
				),
					a.setFromAxisAngle(
						ut,
						n * 0.025 * Math.exp(-h / 0.04) * Math.sin(h * 70)
					);
			}
			break;
		}
		case "spin": {
			const h = i.S;
			let u;
			if (t < l) {
				u = (tt * t) / i.A;
			} else {
				const m = Math.min(h, t - l);
				u = (tt * l + tt * (m - (m * m) / (2 * h))) / i.A;
			}
			const d = 1 - u;
			let f = i.total * u;
			e.tri && (f += 0.1 * Math.sin(3 * f) * d);
			let p;
			if (t < l) {
				const m = t / l;
				p = 1 * (1 - m * m);
			} else {
				const m = t - l;
				(p =
					0.003 *
					Math.abs(Math.sin((Math.PI * m) / 0.08)) *
					Math.exp(-m / 0.05)),
					e.tri && (p += 0.0012 * Math.abs(Math.sin(1.5 * f)) * d);
			}
			if ((o.set(0, p, 0), a.setFromAxisAngle(Q, n * f), t > l)) {
				const m = J((t - l - 0.55 * h) / (0.45 * h)),
					g = 0.06 * Math.sin(Math.PI * m);
				g > 0 &&
					(zt.set(Math.cos(f * 0.7), 0, Math.sin(f * 0.7)),
					a.premultiply(xt.setFromAxisAngle(zt, g)));
			}
			break;
		}
		case "stand": {
			const u = Math.PI / 2 - 0.04;
			if (t < l) {
				const d = t / l;
				E(e, n, u, o, a), (o.y += 1 * (1 - d * d));
			} else if (t < l + i.B) {
				const d = (t - l) / i.B;
				E(e, n, u, o, a),
					(o.y += 0.006 * (0.4 + e.springy) * Math.sin(Math.PI * d));
			} else if (t < l + i.B + i.W) {
				const d = (t - l - i.B) / i.W;
				E(
					e,
					n,
					u - 0.06 * Math.sin(4 * Math.PI * d) * (1 - d) - 0.09 * d * d,
					o,
					a
				);
			} else if (t < i.E) {
				const d = (t - l - i.B - i.W) / i.Tt;
				E(e, n, (u - 0.09) * (1 - d * d), o, a);
			} else {
				const d = t - i.E;
				E(
					e,
					n,
					0.05 *
						(1 - 0.6 * e.heavy) *
						Math.abs(Math.sin((Math.PI * d) / 0.08)) *
						Math.exp(-d / 0.06),
					o,
					a
				);
			}
			break;
		}
		case "skid": {
			const { S: c, D: h, ov: u } = i;
			if (t < l) {
				const d = t / l;
				D.set(n * 0.04, 0.95, 0.62),
					$.set(n * 0.03, 0.12, 0.26),
					G.set(n * 0.012, 0, h),
					ot(D, $, G, d, o),
					a.setFromAxisAngle(Q, n * (0.35 - 0.13 * d));
			} else if (t < l + c) {
				const d = (t - l) / c,
					f = 1 - (1 - d) * (1 - d);
				o.set(n * 0.012 * (1 - f), 0, h - (h + u) * f),
					a.setFromAxisAngle(
						Q,
						n * 0.22 * (1 - d) * (1 - d) * Math.cos(d * c * 18)
					);
			} else {
				const d = J((t - l - c) / 0.14);
				o.set(0, 0, -u * (1 - Ft(d)));
			}
			break;
		}
		case "roll": {
			const { R: c, D: h, total: u } = i;
			if (t < l) {
				const d = t / l;
				D.set(n * 0.03, 0.9, -0.75),
					$.set(n * 0.02, 0.5, -0.42),
					G.set(n * 0.006, 0, -h),
					ot(D, $, G, d, o);
				const f = e.tri ? 6 : (u * 2) / c;
				a.setFromAxisAngle(Rt, f * (t - l));
			} else if (t < l + c) {
				const d = t - l,
					f = d / c;
				let p,
					m,
					g = 0;
				if (e.tri) {
					const k = pe(r, d),
						q = Ft(k.frac);
					(p = (k.i + q) * ((2 * Math.PI) / 3)),
						(m = -h + h * (p / u)),
						(g = 0.35 * e.radius * Math.sin(Math.PI * q));
				} else {
					const k = 1 - (1 - f) * (1 - f);
					(p = u * k),
						(m = -h + h * k),
						e.hex && (g = 0.07 * e.radius * Math.abs(Math.sin(3 * p)));
				}
				o.set(n * 0.006 * (1 - f), g, m), a.setFromAxisAngle(Rt, p);
			}
			break;
		}
		case "place": {
			if (t < l) {
				const h = t / l;
				o.set(0, 1 * (1 - h * h), 0);
			} else {
				const h = t - l;
				o.set(
					0,
					0.0025 *
						Math.abs(Math.sin((Math.PI * h) / 0.08)) *
						Math.exp(-h / 0.05),
					0
				);
			}
			break;
		}
		case "lower": {
			if (t < l) {
				const h = t / l;
				o.set(0, 1 * (1 - h) ** 3, 0);
			}
			break;
		}
		case "set":
		case "lay": {
			if (t < l) {
				const c = t / l,
					h = r.kind === "lay" ? 1 - (1 - c) ** 3 : 1 - (1 - c) * (1 - c);
				D.set(n * 0.03, 0.2, 0.64),
					$.set(n * 0.015, 0.1, 0.22),
					G.set(0, 0, 0),
					ot(D, $, G, h, o),
					a.setFromAxisAngle(Q, n * 0.3 * (1 - h));
			} else if (r.kind === "set") {
				const c = t - l;
				o.set(
					0,
					0.0015 *
						Math.abs(Math.sin((Math.PI * c) / 0.08)) *
						Math.exp(-c / 0.05),
					0
				);
			}
			break;
		}
		case "toss": {
			const { turns: c, phiL: h, B: u, Tt: d } = i;
			if (t < l) {
				const f = t / l;
				D.set(n * 0.06, 1.25, 0.62),
					$.set(n * 0.05, 1.05, 0.22),
					E(e, n, h, G, xt),
					ot(D, $, G, f, o),
					a.setFromAxisAngle(ut, n * (c * 2 * Math.PI + h) * f),
					a.premultiply(xt.setFromAxisAngle(Q, n * 0.45 * (1 - f)));
			} else if (t < l + u) {
				const f = (t - l) / u;
				E(e, n, h, o, a), (o.y += 0.004 * Math.sin(Math.PI * f));
			} else if (t < l + u + d) {
				const f = (t - l - u) / d;
				E(e, n, h * (1 - f * f), o, a);
			} else {
				const f = t - i.E;
				E(
					e,
					n,
					0.045 *
						(1 - 0.6 * e.heavy) *
						Math.abs(Math.sin((Math.PI * f) / 0.08)) *
						Math.exp(-f / 0.06),
					o,
					a
				);
			}
			break;
		}
	}
	return s;
}
function Vt(r) {
	const t = r.land;
	switch (r.kind) {
		case "slap":
			return [{ at: t, dust: 1.2, quake: 0.0035 }];
		case "spin":
			return [{ at: t, dust: 0.35, quake: 0 }];
		case "stand":
			return [
				{ at: t, dust: 0.2, quake: 0 },
				{ at: r.c.E, dust: 0.6, quake: 0.0015 },
			];
		case "skid":
			return [{ at: t, dust: 0.45, quake: 0.001 }];
		case "roll":
			return [{ at: t, dust: 0.4, quake: 0.001 }];
		case "toss":
			return [
				{ at: t, dust: 0.25, quake: 0 },
				{ at: r.c.E, dust: 0.6, quake: 0.0015 },
			];
		case "place":
			return [{ at: t, dust: 0.3, quake: 0 }];
		case "set":
			return [{ at: t, dust: 0.15, quake: 0 }];
		case "lower":
		case "lay":
			return [];
	}
}
function Ct(r, t, s, e) {
	const { b: n, c: i } = r,
		o = s + r.land,
		a = { heavy: n.heavy, metal: n.metal, springy: n.springy, tri: n.tri };
	switch (r.kind) {
		case "slap":
			t.whoosh(o - 0.12, 0.12, 400, 1800, 0.5, 0, e),
				t.slap(o, 1.3, e),
				t.landing(o, a, e),
				t.thump(o, 0.8 + 0.4 * n.heavy, e),
				n.heavy > 0.4 && t.boom(o, 0.25 + 0.4 * n.heavy, e);
			break;
		case "spin":
			t.whoosh(s, r.land, 300, 900, 0.25, 0, e),
				t.tap(o, 0.9, e),
				t.whirr(o, i.S, 240 - 60 * n.long, 70, e, 1),
				t.tap(s + r.done, 0.7, e),
				t.hiss(s + r.done, 0.02, 0.1, "bandpass", 2400, 1.5, e);
			break;
		case "stand":
			t.whoosh(s, r.land, 300, 1100, 0.25, 0, e),
				t.tap(o, 1, e),
				t.hiss(o, 0.015, 0.2, "highpass", 4200, 0.8, e),
				t.tap(o + i.B, 0.45, e),
				t.landing(s + i.E, a, e),
				t.slap(s + i.E, 0.5, e);
			break;
		case "skid":
			t.whoosh(s, r.land, 700, 3600, 0.5, 0, e),
				t.tap(o, 0.7, e),
				t.skid(o, i.S, 2600 - 600 * n.heavy, 0.9, e),
				t.knock(o + i.S, 0.35, e);
			break;
		case "roll": {
			if (
				(t.whoosh(s, r.land, 500, 2400, 0.45, 0, e), t.landing(o, a, e), n.tri)
			) {
				let l = 0;
				for (let c = 0; c < i.steps; c++) {
					(l += 0.055 * (1 + 0.4 * c)),
						t.hiss(
							o + l,
							0.04,
							0.3 * (1 - c / (i.steps + 2)),
							"bandpass",
							1450,
							1.6,
							e
						),
						t.tone(
							o + l,
							"triangle",
							620,
							540,
							0.04,
							0.16 * (1 - c / (i.steps + 2)),
							0.07,
							e
						);
				}
			} else if (n.hex) {
				let l = -1;
				for (let c = 1; c * (Math.PI / 3) < i.total; c++) {
					const h = (c * Math.PI) / 3 / i.total,
						u = i.R * (1 - Math.sqrt(1 - h));
					u - l < 0.014 || ((l = u), t.tap(o + u, 0.35 + 0.3 * h, e));
				}
			} else {
				t.roll(o, i.R * 0.95, e);
			}
			t.tap(s + r.done, 0.4, e);
			break;
		}
		case "place":
		case "set":
			t.tap(o, 0.9, e), t.thump(o, 0.35, e);
			break;
		case "lower":
		case "lay":
			t.tap(o, 0.3, e);
			break;
		case "toss": {
			t.whoosh(s, r.land, 450, 2600, 0.6, 0, e);
			const l = Math.round(i.turns * 2);
			for (let c = 1; c <= l; c++) {
				t.hiss(s + r.land * (c / (l + 1)), 0.05, 0.05, "bandpass", 900, 1.2, e);
			}
			t.tap(o, 1, e),
				t.hiss(o, 0.02, 0.18, "bandpass", 3e3, 2, e),
				t.landing(s + i.E, a, e),
				t.slap(s + i.E, 0.4, e);
			break;
		}
	}
}
const C = (r) => (r === "a" ? "b" : "a"),
	me = ["paper", "balls", "planes", "gulal", "thunder"];
function we(r, t) {
	const s = Math.max(0, Math.floor(t)),
		e = Math.floor(s / 3),
		n = s % 3,
		i = j(((r ^ 40_503) + Math.imul(e, 739_982_445)) >>> 0),
		o = [...fe];
	for (let h = o.length - 1; h > 0; h--) {
		const u = Math.floor(i() * (h + 1));
		[o[h], o[u]] = [o[u], o[h]];
	}
	const a = j(((r ^ 20_973) + Math.imul(s, 7919)) >>> 0),
		l = a() < 0.5 ? 1 : -1,
		c = a() < 0.5 ? 1 : -1;
	return { A: { entry: o[n * 2], lat: l }, B: { entry: o[n * 2 + 1], lat: c } };
}
function be(r, t) {
	const s = r ? t.A : t.B,
		e = r ? t.B : t.A;
	return { entries: { a: s.entry, b: e.entry }, lat: { a: s.lat, b: e.lat } };
}
function Et(r, t) {
	const s = j(r),
		e = [...me];
	for (let n = e.length - 1; n > 0; n--) {
		const i = Math.floor(s() * (n + 1));
		[e[n], e[i]] = [e[i], e[n]];
	}
	return e[((t % e.length) + e.length) % e.length];
}
function ge(r) {
	if (r.backFromTwoDown) {
		return ["thunder"];
	}
	const t = Et(r.deskSeed, r.matchNo);
	return r.penChangedHands ? [t, Et(r.deskSeed, r.matchNo + 1)] : [t];
}
function ye(r, t) {
	let s = 0,
		e = 0;
	for (const n of r) {
		if ((n === t ? s++ : e++, s === 0 && e === 2)) {
			return !0;
		}
	}
	return !1;
}
function Me(r, t, s) {
	const e = new Set(t);
	if (e.size === 0) {
		return null;
	}
	if (e.size === 2) {
		return { flicks: 0, how: "both", striker: r, winner: null };
	}
	const n = e.has(r),
		i = n ? C(r) : r;
	return {
		flicks: n ? 0 : Math.max(1, s[i]),
		how: n ? "self" : "flick",
		striker: r,
		winner: i,
	};
}
function xe(r, t, s, e = !1) {
	if (!r.winner) {
		return "both out";
	}
	if (r.how === "self") {
		const n = C(r.winner);
		return e || n !== t ? `${s[n]} self out` : "self out";
	}
	return r.flicks <= 1 ? "one flick!" : `in ${r.flicks} flicks`;
}
function ve(r, t) {
	const s = r.a === t - 1,
		e = r.b === t - 1;
	return s && e
		? { kind: "decider" }
		: s
			? { kind: "match point", who: "a" }
			: e
				? { kind: "match point", who: "b" }
				: { kind: "round", n: r.a + r.b + 1 };
}
function Dt(r, t) {
	return r ? (r === t ? "var(--red)" : "var(--ink)") : "var(--chalk-word)";
}
const ft = 2.6,
	pt = (r) => Math.min(1, Math.max(0, r));
let ke = null;
const Pt = () => ke ?? (ke = de()),
	Qt = () => new yt({ map: Pt(), roughness: 0.92, side: Tt, vertexColors: !1 }),
	Zt = () =>
		new yt({ color: 14_266_954, metalness: 0.95, roughness: 0.18, side: Tt }),
	Kt = () => new yt({ flatShading: !0, map: Pt(), roughness: 0.95 }),
	Jt = () => new yt({ map: Pt(), roughness: 0.9, side: Tt });
let at = null;
function Ae() {
	if (at) {
		return at;
	}
	const r = document.createElement("canvas");
	r.width = r.height = 64;
	const t = r.getContext("2d"),
		s = t.createRadialGradient(32, 32, 0, 32, 32, 32);
	return (
		s.addColorStop(0, "rgba(255,255,255,0.9)"),
		s.addColorStop(0.5, "rgba(255,255,255,0.35)"),
		s.addColorStop(1, "rgba(255,255,255,0)"),
		(t.fillStyle = s),
		t.fillRect(0, 0, 64, 64),
		(at = new St(r)),
		at
	);
}
const te = (r) =>
		new Xt({
			color: r,
			depthWrite: !1,
			map: Ae(),
			opacity: 0,
			size: 0.05,
			sizeAttenuation: !0,
			transparent: !0,
		}),
	ee = (r) =>
		new _t({
			color: r,
			depthWrite: !1,
			opacity: 0,
			polygonOffset: !0,
			polygonOffsetFactor: -2,
			transparent: !0,
		});
function Te() {
	const r = new _(0.01, 0.01),
		t = (i) => {
			const o = new X(r, i, 1);
			return o.setColorAt(0, new jt(1, 1, 1)), (o.frustumCulled = !1), o;
		},
		s = (i, o) => {
			const a = new X(i, o, 1);
			return (a.castShadow = !0), (a.frustumCulled = !1), a;
		},
		e = new et();
	e.setAttribute("position", new wt(new Float32Array(3), 3));
	const n = new bt(e, te(16_777_215));
	return (
		(n.frustumCulled = !1),
		[
			t(Qt()),
			t(Zt()),
			s(se(), Kt()),
			s(ne(), Jt()),
			n,
			new gt(new Yt(0.01, 8), ee(16_777_215)),
		]
	);
}
function z(r, t) {
	return r.near ? t : t * 0.35;
}
function Se(r, t, s = 1) {
	const e = Math.round(520 * s),
		n = [
			15_986_140, 15_986_140, 15_659_238, 15_288_379, 15_843_890, 4_891_482,
			4_094_934, 15_764_028,
		],
		i = new _(0.011, 0.008),
		o = Qt(),
		a = new X(i, o, e),
		l = Math.round(40 * s),
		c = new X(new _(0.012, 0.009), Zt(), l);
	for (const v of [a, c]) {
		(v.frustumCulled = !1), v.instanceMatrix.setUsage(At), r.group.add(v);
	}
	const h = new jt();
	for (let v = 0; v < e; v++) {
		a.setColorAt(v, h.setHex(n[Math.floor(t() * n.length)]));
	}
	const u = [14_266_954, 9_329_617, 13_225_686, 14_240_362];
	for (let v = 0; v < l; v++) {
		c.setColorAt(v, h.setHex(u[v % u.length]));
	}
	const d = e + l,
		f = new Float32Array(d * 3),
		p = new Float32Array(d * 3),
		m = new Float32Array(d * 3),
		g = new Float32Array(d),
		k = new Float32Array(d),
		q = new Float32Array(d),
		b = new Uint8Array(d),
		M = new Float32Array(d),
		L = r.winnerPen;
	for (let v = 0; v < d; v++) {
		const I = t(),
			P = t() < 0.5 ? -1 : 1;
		I < 0.8
			? ((f[v * 3] = P * (r.desk.w / 2 + 0.06 + t() * 0.08)),
				(f[v * 3 + 1] = -0.05 + t() * 0.05),
				(f[v * 3 + 2] = L.z + (t() - 0.5) * 0.25),
				(p[v * 3] = -P * (0.15 + t() * 0.35)),
				(p[v * 3 + 1] = 0.9 + t() * 0.8),
				(p[v * 3 + 2] = (t() - 0.5) * 0.4 - 0.1))
			: ((f[v * 3] = (t() - 0.5) * 0.3),
				(f[v * 3 + 1] = r.eye.y + 0.05 + t() * 0.1),
				(f[v * 3 + 2] = r.eye.z + 0.1),
				(p[v * 3] = (t() - 0.5) * 0.4),
				(p[v * 3 + 1] = 0.2 + t() * 0.3),
				(p[v * 3 + 2] = -(0.5 + t() * 0.6)));
		const N = new y(t() - 0.5, t() - 0.5, t() - 0.5).normalize();
		(m[v * 3] = N.x),
			(m[v * 3 + 1] = N.y),
			(m[v * 3 + 2] = N.z),
			(g[v] = 5 + t() * 12),
			(k[v] = t() * 6.28),
			(q[v] = t() < 0.6 ? t() * 0.12 : 0.18 + t() * 0.3);
	}
	let S = 0,
		B = -1;
	const A = new dt(),
		T = new R(),
		x = new y(),
		F = new y(),
		V = new y(),
		st = r.desk.w / 2,
		nt = r.desk.d / 2,
		qt = r.sound.now();
	return (
		r.sound.whoosh(qt, 0.5, 300, 2600, z(r, 1.4)),
		r.sound.hiss(qt + 0.2, 2.2, z(r, 0.06), "bandpass", 3400, 0.6),
		{
			dispose: () => {
				r.group.remove(a, c),
					i.dispose(),
					o.dispose(),
					c.geometry.dispose(),
					c.material.dispose();
			},
			sweep: () => {
				B = S;
			},
			update: (v) => {
				S += v;
				for (let I = 0; I < d; I++) {
					const P = I * 3,
						N = S >= q[I];
					if (N && !b[I]) {
						p[P + 1] -= ft * 1.6 * v;
						const It = Math.exp(-3.2 * v);
						(p[P] *= It),
							(p[P + 2] *= It),
							p[P + 1] < -0.32 && (p[P + 1] = -0.32 + (p[P + 1] + 0.32) * 0.3),
							(f[P] += (p[P] + Math.sin(S * 3 + I) * 0.05) * v),
							(f[P + 1] += p[P + 1] * v),
							(f[P + 2] += (p[P + 2] + Math.cos(S * 2.4 + I) * 0.04) * v),
							(k[I] += g[I] * v);
						const Lt = Math.abs(f[P]) < st && Math.abs(f[P + 2]) < nt;
						Lt &&
							f[P + 1] <= 0.0012 &&
							p[P + 1] < 0 &&
							((f[P + 1] = 0.0012), (b[I] = 1)),
							!Lt && f[P + 1] < -0.8 && (b[I] = 2);
					}
					b[I] === 1 && (M[I] += v),
						B >= 0 &&
							b[I] === 1 &&
							(f[P] += Math.sign(f[P] || 1) * (S - B) * 0.9 * v * 4),
						F.set(f[P], f[P + 1], f[P + 2]),
						b[I] === 1
							? T.setFromAxisAngle(V.set(1, 0, 0), -Math.PI / 2)
							: T.setFromAxisAngle(V.set(m[P], m[P + 1], m[P + 2]), k[I]);
					const re = N && b[I] !== 2 && !(B >= 0 && Math.abs(f[P]) > st + 0.05);
					x.setScalar(re ? 1 : 0),
						A.compose(F, T, x),
						I < e ? a.setMatrixAt(I, A) : c.setMatrixAt(I - e, A);
				}
				(a.instanceMatrix.needsUpdate = !0),
					(c.instanceMatrix.needsUpdate = !0);
			},
		}
	);
}
function se() {
	const r = new ue(0.0105, 1),
		t = r.getAttribute("position"),
		s = new y();
	for (let e = 0; e < t.count; e++) {
		s.fromBufferAttribute(t, e),
			s.multiplyScalar(
				0.8 +
					0.35 * Math.abs(Math.sin(s.x * 410 + s.y * 230) * Math.cos(s.z * 370))
			),
			t.setXYZ(e, s.x, s.y, s.z);
	}
	return r.computeVertexNormals(), r;
}
function Pe(r, t) {
	const e = se(),
		n = Kt(),
		i = new X(e, n, 72);
	(i.frustumCulled = !1),
		(i.castShadow = !0),
		i.instanceMatrix.setUsage(At),
		r.group.add(i);
	const o = new Float32Array(216),
		a = new Float32Array(216),
		l = new Float32Array(72),
		c = new Uint8Array(72),
		h = new Float32Array(72),
		u = new Float32Array(144),
		d = r.winnerPen,
		f = r.desk.w / 2,
		p = r.desk.d / 2;
	for (let A = 0; A < 72; A++) {
		const T = A < 3 ? 0 : 1 + Math.floor(t() * 3);
		(l[A] = T === 0 ? 0.05 + A * 0.12 : (T - 1) * 0.32 + t() * 0.22),
			(h[A] = 0.75 + t() * 0.6);
		let x, F;
		if (A < 3) {
			(x = r.eye.clone().add(new y((A - 1) * 0.06, 0.03, 0.12))),
				(F = new y((A - 1) * 0.12, 0.02, d.z - 0.4));
		} else {
			t() < 0.45
				? (x = new y(
						(t() - 0.5) * 0.5,
						r.eye.y * (0.7 + t() * 0.5),
						r.eye.z + 0.25 + t() * 0.3
					))
				: (x = new y(
						(t() < 0.5 ? -1 : 1) * (0.6 + t() * 0.3),
						0.3 + t() * 0.4,
						d.z + (t() - 0.6) * 0.8
					));
			const nt = t();
			nt < 0.6
				? (F = new y(
						(t() - 0.5) * r.desk.w * 0.9,
						0.011,
						d.z + (t() - 0.65) * 0.55
					))
				: nt < 0.8
					? (F = new y(
							(t() - 0.5) * 0.8,
							r.boardBottom + t() * (r.boardTop - r.boardBottom),
							r.boardZ + 0.02
						))
					: (F = d
							.clone()
							.add(new y((t() - 0.5) * 0.06, 0.012, (t() - 0.5) * 0.04)));
		}
		const V = A < 3 ? 0.42 : 0.45 + t() * 0.35;
		(o[A * 3] = x.x),
			(o[A * 3 + 1] = x.y),
			(o[A * 3 + 2] = x.z),
			(a[A * 3] = (F.x - x.x) / V),
			(a[A * 3 + 1] = (F.y - x.y + 0.5 * ft * V * V) / V),
			(a[A * 3 + 2] = (F.z - x.z) / V),
			(u[A * 2] = t() * 10),
			(u[A * 2 + 1] = 4 + t() * 8);
	}
	let m = 0,
		g = -1;
	const k = new dt(),
		q = new R(),
		b = new vt(),
		M = new y(),
		L = new y();
	r.sound.now();
	const S = r.sound,
		B = [];
	return {
		dispose: () => {
			r.group.remove(i), e.dispose(), n.dispose();
		},
		sweep: () => {
			g = m;
		},
		update: (A) => {
			m += A;
			for (let T = 0; T < 72; T++) {
				const x = T * 3;
				if (m < l[T] || c[T] === 3) {
					continue;
				}
				c[T] === 0 && (c[T] = 1),
					(a[x + 1] -= ft * A),
					(o[x] += a[x] * A),
					(o[x + 1] += a[x + 1] * A),
					(o[x + 2] += a[x + 2] * A),
					(u[T * 2] += u[T * 2 + 1] * A);
				const F = Math.abs(o[x]) < f && Math.abs(o[x + 2]) < p,
					V = 0.0105 * h[T];
				F &&
					o[x + 1] < V &&
					a[x + 1] < 0 &&
					((o[x + 1] = V),
					Math.abs(a[x + 1]) > 0.35 &&
						(B.length < 24 &&
							(B.push(m),
							S.tap(S.now(), z(r, 0.5 + t() * 0.3)),
							S.hiss(S.now(), 0.05, z(r, 0.06), "lowpass", 800, 0.7)),
						Math.hypot(o[x] - d.x, o[x + 2] - d.z) < 0.05 &&
							r.bumpPen("winner", 0.4)),
					(a[x + 1] = -a[x + 1] * 0.32),
					(a[x] *= 0.62),
					(a[x + 2] *= 0.62),
					(u[T * 2 + 1] *= 0.6)),
					o[x + 2] < r.boardZ + 0.03 &&
						o[x + 1] > r.boardBottom - 0.05 &&
						a[x + 2] < 0 &&
						((a[x + 2] = -a[x + 2] * 0.25),
						(a[x] *= 0.5),
						S.knock(S.now(), z(r, 0.5))),
					!F && o[x + 1] < -0.9 && (c[T] = 3);
			}
			if (g >= 0) {
				for (let T = 0; T < 72; T++) {
					c[T] === 1 &&
						o[T * 3 + 1] < 0.03 &&
						(a[T * 3] += Math.sign(o[T * 3] || 1) * 4 * A);
				}
			}
			for (let T = 0; T < 72; T++) {
				const x = T * 3;
				L.set(o[x], o[x + 1], o[x + 2]),
					b.set(u[T * 2], u[T * 2] * 0.7, 0),
					q.setFromEuler(b),
					M.setScalar(m >= l[T] && c[T] !== 3 ? h[T] : 0),
					k.compose(L, q, M),
					i.setMatrixAt(T, k);
			}
			i.instanceMatrix.needsUpdate = !0;
		},
	};
}
function ne() {
	const s = [
			0.035, 0, 0, -0.035, 0.004, -0.032, -0.035, 0, 0, 0.035, 0, 0, -0.035, 0,
			0, -0.035, 0.004, 0.032, 0.035, 0, 0, -0.035, 0, 0, -0.035, -0.011, 0,
		],
		e = new et();
	return e.setAttribute("position", new le(s, 3)), e.computeVertexNormals(), e;
}
function qe(r, t) {
	const e = ne(),
		n = Jt(),
		i = new X(e, n, 20);
	(i.frustumCulled = !1),
		(i.castShadow = !0),
		i.instanceMatrix.setUsage(At),
		r.group.add(i);
	const o = r.winnerPen,
		a = [],
		l = (b) => o.z - 0.08 + b * 0.3;
	for (let b = 0; b < 20; b++) {
		const M = t() < 0.5 ? -1 : 1;
		b === 0
			? a.push({
					dur: 1.3,
					from: r.eye.clone().add(new y(0.05, 0.03, 0.18)),
					kind: "past",
					lift: 0.02,
					t0: 0.25,
					to: new y(-0.12, 0.18, o.z - 0.7),
				})
			: b <= 3
				? a.push({
						dur: 1.1,
						from: new y(M * 0.7, 0.24 + b * 0.03, l(0.2 + b * 0.12)),
						kind: "glide",
						lift: 0.015,
						t0: 0.05 + b * 0.06,
						to: new y(-M * 0.7, 0.2 + b * 0.03, l(0.1 + b * 0.12)),
					})
				: b === 4
					? a.push({
							dur: 1.6,
							from: new y(-0.6, 0.26, l(0.5)),
							kind: "loop",
							lift: 0,
							t0: 0.3,
							to: new y(0.6, 0.28, l(0.4)),
						})
					: b <= 6
						? a.push({
								dur: 0.7,
								from: new y((b === 5 ? -1 : 1) * 0.6, 0.3, l(0.45)),
								kind: "crash",
								lift: 0,
								t0: 0.45,
								to: new y(0, 0.28, l(0.45)),
							})
						: b <= 11
							? a.push({
									dur: 0.7 + t() * 0.3,
									from: new y(
										M * (0.4 + t() * 0.3),
										0.32 + t() * 0.15,
										o.z + 0.35 + t() * 0.2
									),
									kind: "stick",
									lift: 0,
									t0: 0.15 + t() * 0.8,
									to: new y(
										(t() - 0.5) * r.desk.w * 0.8,
										0,
										o.z - 0.12 + t() * 0.24
									),
								})
							: a.push({
									dur: 1 + t() * 0.6,
									from: new y(M * (0.6 + t() * 0.3), 0.16 + t() * 0.26, l(t())),
									kind: "glide",
									lift: 0.02 + t() * 0.02,
									t0: t() * 1.1,
									to: new y(
										-M * (0.6 + t() * 0.3),
										0.14 + t() * 0.26,
										l(t()) - 0.1
									),
								});
	}
	let c = 0;
	const h = new dt(),
		u = new R(),
		d = new y(),
		f = new y(),
		p = new y(),
		m = new dt(),
		g = r.sound,
		k = g.now();
	a.forEach((b, M) => {
		M < 14 &&
			g.whoosh(
				k + b.t0,
				Math.min(1.2, b.dur),
				300,
				1300,
				z(r, b.kind === "past" ? 1.1 : 0.3),
				b.from.x > 0 ? 0.6 : -0.6
			);
	}),
		g.whistle(k + 0.3, 0.5, !0, z(r, 1)),
		g.hiss(k + 1.15, 0.08, z(r, 0.22), "bandpass", 1800, 1);
	const q = (b, M, L) => {
		if (
			(L.lerpVectors(b.from, b.to, M),
			b.kind === "loop" && M > 0.35 && M < 0.75)
		) {
			const S = ((M - 0.35) / 0.4) * Math.PI * 2;
			(L.y += Math.sin(S) * 0.09),
				(L.x -= (1 - Math.cos(S)) * 0.03 * Math.sign(b.to.x - b.from.x));
		} else {
			b.kind === "stick"
				? (L.y = b.from.y * (1 - M) * (1 - M * 0.2))
				: (L.y += b.lift * Math.sin(M * Math.PI * 2));
		}
		return L;
	};
	return {
		dispose: () => {
			r.group.remove(i), e.dispose(), n.dispose();
		},
		sweep: () => {
			c = 99;
		},
		update: (b) => {
			(c += b),
				a.forEach((M, L) => {
					let S = (c - M.t0) / M.dur,
						B = S > 0;
					if (M.kind === "crash" && S >= 1) {
						const A = c - M.t0 - M.dur;
						f
							.copy(M.to)
							.add(new y((L === 5 ? -1 : 1) * A * 0.08, -ft * 0.5 * A * A, 0)),
							(B = f.y > -0.6),
							u.setFromEuler(new vt(A * 9, A * 5, A * 7)),
							d.set(0.7, 0.6, 0.7);
					} else {
						M.kind === "stick" && S >= 1
							? (f.copy(M.to),
								u.setFromEuler(
									new vt(
										0,
										Math.atan2(-(M.to.z - M.from.z), M.to.x - M.from.x),
										-0.55
									)
								),
								d.setScalar(1),
								(S = 1))
							: ((B = B && S < 1),
								q(M, pt(S), f),
								q(M, pt(S + 0.01), p),
								m.lookAt(f, p, new y(0, 1, 0)),
								u
									.setFromRotationMatrix(m)
									.multiply(
										new R().setFromAxisAngle(new y(0, 1, 0), -Math.PI / 2)
									),
								u.multiply(
									new R().setFromAxisAngle(
										new y(1, 0, 0),
										0.25 * Math.sin(S * 7 + L)
									)
								),
								d.setScalar(M.kind === "past" ? 1.6 : 1));
					}
					h.compose(f, u, B ? d : d.setScalar(0)), i.setMatrixAt(L, h);
				}),
				(i.instanceMatrix.needsUpdate = !0);
		},
	};
}
function Ie(r, t) {
	const s = [16_727_950, 16_764_718, 3_457_627, 16_742_938, 3_898_623],
		e = 160,
		n = r.winnerPen,
		i = s.map((h, u) => {
			const d = new et(),
				f = new Float32Array(e * 3);
			d.setAttribute("position", new wt(f, 3));
			const p = te(h),
				m = new bt(d, p);
			(m.frustumCulled = !1), r.group.add(m);
			const g = u % 2 ? 1 : -1,
				k = new y(g * (r.desk.w / 2 + 0.05), -0.05, n.z + (u - 2) * 0.12),
				q = new Float32Array(e * 3);
			for (let b = 0; b < e; b++) {
				(f[b * 3] = k.x),
					(f[b * 3 + 1] = k.y),
					(f[b * 3 + 2] = k.z),
					(q[b * 3] = -g * (0.1 + t() * 0.45)),
					(q[b * 3 + 1] = 0.2 + t() * 0.42),
					(q[b * 3 + 2] = (t() - 0.5) * 0.4);
			}
			return { geo: d, mat: p, pts: m, t0: u * 0.14, vel: q };
		}),
		o = s.map((h) => {
			const u = new gt(new Yt(0.05 + t() * 0.04, 20), ee(h));
			return (
				(u.rotation.x = -Math.PI / 2),
				u.position.set((t() - 0.5) * r.desk.w * 0.8, 9e-4, n.z - t() * 0.3),
				r.group.add(u),
				u
			);
		});
	let a = 0;
	const l = r.sound,
		c = l.now();
	return (
		i.forEach((h) => {
			l.whoosh(c + h.t0, 0.45, 160, 600, z(r, 0.8)),
				l.hiss(c + h.t0, 0.3, z(r, 0.08), "lowpass", 500, 0.7);
		}),
		{
			dispose: () => {
				for (const h of i) {
					r.group.remove(h.pts), h.geo.dispose(), h.mat.dispose();
				}
				for (const h of o) {
					r.group.remove(h), h.geometry.dispose(), h.material.dispose();
				}
			},
			sweep: () => {
				o.forEach((h) => {
					h.visible = !1;
				});
			},
			update: (h) => {
				a += h;
				for (const u of i) {
					const d = a - u.t0;
					if (d < 0) {
						continue;
					}
					const f = u.geo.getAttribute("position"),
						p = Math.exp(-1.6 * h);
					for (let m = 0; m < e; m++) {
						(u.vel[m * 3] *= p),
							(u.vel[m * 3 + 2] *= p),
							(u.vel[m * 3 + 1] = u.vel[m * 3 + 1] * p - 0.12 * h),
							f.setXYZ(
								m,
								f.getX(m) + u.vel[m * 3] * h,
								f.getY(m) + u.vel[m * 3 + 1] * h,
								f.getZ(m) + u.vel[m * 3 + 2] * h
							);
					}
					(f.needsUpdate = !0),
						(u.mat.size = 0.03 + Math.min(0.036, d * 0.035)),
						(u.mat.opacity = Math.min(0.34, d * 2) * (1 - pt((d - 1.6) / 1.4)));
				}
				o.forEach((u, d) => {
					u.material.opacity = 0.35 * pt((a - 0.9 - d * 0.1) / 0.6);
				});
			},
		}
	);
}
function Le(r) {
	const t = [0, 0.32, 0.64, 0.86, 1.02, 1.18, 1.3, 1.42, 1.52, 1.62, 1.72],
		s = r.sound,
		e = s.now();
	t.forEach((o, a) => {
		s.thump(e + o, z(r, 1.1 + a * 0.05)),
			s.stomp(e + o + 0.02, z(r, 0.6)),
			s.slap(e + o, z(r, 0.6));
	});
	let n = 0,
		i = 0;
	return {
		dispose: () => r.tube(0),
		sweep: () => {},
		update: (o) => {
			for (n += o; i < t.length && n >= t[i]; ) {
				r.quake(r.near ? 0.006 : 0.003),
					r.bumpPen("winner", 0.6),
					r.bumpPen("loser", 0.4),
					r.tube(i % 2 ? 0.25 : 0.6),
					i++;
			}
			n > 1.9 && r.tube(0);
		},
	};
}
function Fe(r, t, s) {
	const e = j(s);
	switch (r) {
		case "paper":
			return Se(t, e);
		case "balls":
			return Pe(t, e);
		case "planes":
			return qe(t, e);
		case "gulal":
			return Ie(t, e);
		case "thunder":
			return Le(t);
	}
}
let rt = null;
function Re() {
	if (rt) {
		return rt;
	}
	const r = document.createElement("canvas");
	r.width = r.height = 64;
	const t = r.getContext("2d"),
		s = t.createRadialGradient(32, 32, 0, 32, 32, 32);
	return (
		s.addColorStop(0, "rgba(255,255,255,1)"),
		s.addColorStop(0.35, "rgba(255,255,255,0.55)"),
		s.addColorStop(1, "rgba(255,255,255,0)"),
		(t.fillStyle = s),
		t.fillRect(0, 0, 64, 64),
		(rt = new St(r)),
		rt
	);
}
const ct = 70;
function ie() {
	return new Xt({
		color: 15_986_402,
		depthWrite: !1,
		map: Re(),
		opacity: 0,
		size: 0.009,
		sizeAttenuation: !0,
		transparent: !0,
	});
}
function ze() {
	const r = new et();
	r.setAttribute("position", new wt(new Float32Array(3), 3));
	const t = new bt(r, ie());
	return (t.frustumCulled = !1), t;
}
class Be {
	constructor(t) {
		w(this, "points");
		w(this, "vel", new Float32Array(ct * 3));
		w(this, "mat");
		w(this, "age", 0);
		w(this, "life", 1);
		w(this, "lift", 0);
		w(this, "active", !1);
		const s = new et();
		s.setAttribute("position", new wt(new Float32Array(ct * 3), 3)),
			(this.mat = ie()),
			(this.points = new bt(s, this.mat)),
			(this.points.frustumCulled = !1),
			(this.points.visible = !1),
			t.add(this.points);
	}
	fire(t, s) {
		const e = this.points.geometry.getAttribute("position");
		for (let n = 0; n < ct; n++) {
			const i = Math.random() * Math.PI * 2,
				o = Math.random() ** 0.6;
			e.setXYZ(
				n,
				t.x + (Math.random() - 0.5) * 0.01,
				t.y + Math.random() * 0.004,
				t.z + (Math.random() - 0.5) * 0.01
			),
				(this.vel[n * 3] = Math.cos(i) * o * s.spread.x * s.power),
				(this.vel[n * 3 + 1] = (0.3 + Math.random() * 0.7) * s.up * s.power),
				(this.vel[n * 3 + 2] = Math.sin(i) * o * s.spread.z * s.power);
		}
		(e.needsUpdate = !0),
			(this.mat.size = s.size),
			(this.lift = s.lift),
			(this.age = 0),
			(this.life = s.life),
			(this.active = !0),
			(this.points.visible = !0);
	}
	update(t) {
		if (!this.active) {
			return;
		}
		this.age += t;
		const s = this.age / this.life;
		if (s >= 1) {
			(this.active = !1), (this.points.visible = !1);
			return;
		}
		const e = this.points.geometry.getAttribute("position"),
			n = Math.exp(-2.4 * t);
		for (let i = 0; i < ct; i++) {
			(this.vel[i * 3] *= n),
				(this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * n + this.lift * t),
				(this.vel[i * 3 + 2] *= n),
				e.setXYZ(
					i,
					e.getX(i) + this.vel[i * 3] * t,
					e.getY(i) + this.vel[i * 3 + 1] * t,
					e.getZ(i) + this.vel[i * 3 + 2] * t
				);
		}
		(e.needsUpdate = !0), (this.mat.opacity = (1 - s) * (1 - s) * 0.85);
	}
}
class Ve {
	constructor(t) {
		w(this, "pool", []);
		w(this, "next", 0);
		for (let s = 0; s < 6; s++) {
			this.pool.push(new Be(t));
		}
	}
	desk(t, s) {
		this.take().fire(t, {
			life: 1.3,
			lift: 0.02,
			power: s,
			size: 0.0075,
			spread: new y(0.32, 0, 0.32),
			up: 0.16,
		});
	}
	board(t, s) {
		this.take().fire(t, {
			life: 1.5,
			lift: -0.22,
			power: 1,
			size: 0.016,
			spread: new y(s * 0.35, 0, 0.05),
			up: 0.1,
		});
	}
	take() {
		const t = this.pool[this.next];
		return (this.next = (this.next + 1) % this.pool.length), t;
	}
	update(t) {
		for (const s of this.pool) {
			s.update(t);
		}
	}
	dispose() {
		for (const t of this.pool) {
			t.points.removeFromParent(),
				t.points.geometry.dispose(),
				t.points.material.dispose();
		}
		this.pool = [];
	}
}
const K = (r) => Math.min(1, Math.max(0, r)),
	Ce = (r) => {
		const t = K(r);
		return t * t * (3 - 2 * t);
	},
	Ee = 0.42,
	De = {
		a: { back: 0.62, rise: 0.2, turn: 0.5 },
		b: { back: 0.14, rise: 1.5, turn: 0.3 },
	},
	$e = 0.5,
	O = 0.34,
	U = new y(0, 1, 0),
	Ge = new y(1, 0, 0),
	H = new R(),
	ht = new R(),
	$t = new R(),
	Gt = new R(),
	Ot = new y(),
	Y = new y();
let lt = null;
function Oe() {
	if (lt) {
		return lt;
	}
	const r = document.createElement("canvas");
	r.width = r.height = 64;
	const t = r.getContext("2d"),
		s = t.createRadialGradient(32, 32, 0, 32, 32, 32);
	return (
		s.addColorStop(0, "rgba(255,255,255,1)"),
		s.addColorStop(0.5, "rgba(255,255,255,0.55)"),
		s.addColorStop(1, "rgba(255,255,255,0)"),
		(t.fillStyle = s),
		t.fillRect(0, 0, 64, 64),
		(lt = new St(r)),
		lt
	);
}
function oe() {
	return new _t({
		color: 0,
		depthWrite: !1,
		map: Oe(),
		opacity: 0,
		polygonOffset: !0,
		polygonOffsetFactor: -2,
		transparent: !0,
	});
}
const mt = new WeakMap();
function Ht(r, t, s) {
	const e = mt.get(r);
	(e && Math.abs(e.x - t) < 2 && Math.abs(e.y - s) < 2) ||
		(mt.set(r, { x: t, y: s }),
		(r.style.left = `${t}px`),
		(r.style.top = `${s}px`));
}
function W(r) {
	return r.replace(
		/[&<>"]/g,
		(t) => ({ '"': "&quot;", "&": "&amp;", "<": "&lt;", ">": "&gt;" })[t]
	);
}
function Wt(r, t) {
	Y.set(1, 0, 0).applyQuaternion(r);
	let s = Math.atan2(-Y.z, Y.x) - t;
	while (s > Math.PI / 2) {
		s -= Math.PI;
	}
	while (s <= -Math.PI / 2) {
		s += Math.PI;
	}
	return s;
}
class He {
	constructor(t, s, e) {
		w(this, "clock", 0);
		w(this, "T", 0);
		w(this, "length", 0);
		w(this, "cues", []);
		w(this, "live", !1);
		w(this, "act", null);
		w(this, "entries", {});
		w(this, "hidden", new Set());
		w(this, "trophy", null);
		w(this, "twirl", null);
		w(this, "bumps", { a: { amp: 0, t: 0 }, b: { amp: 0, t: 0 } });
		w(this, "celebrations", []);
		w(this, "litter", []);
		w(this, "celebGroup", new kt());
		w(this, "anchored", []);
		w(this, "names", []);
		w(this, "layers", new Map());
		w(this, "won", []);
		w(this, "nearStage", {});
		w(this, "deskDust", {});
		w(this, "roomCheer", null);
		w(this, "ticking", null);
		w(this, "deciderOn", !1);
		w(this, "pose", { pos: new y(), quat: new R(), visible: !0 });
		w(this, "offDesk", new Set());
		w(this, "lifts", {});
		w(this, "shown", {
			a: { ok: !1, pos: new y(), quat: new R() },
			b: { ok: !1, pos: new y(), quat: new R() },
		});
		w(this, "returning", null);
		w(this, "shadows", {});
		w(this, "leaving", []);
		w(this, "hushed", !1);
		w(this, "lit", 1);
		w(this, "tone", 1);
		w(this, "holding", !1);
		w(this, "target", 3);
		(this.host = t),
			(this.players = s),
			(this.phones = e),
			t.stage.add(this.celebGroup);
		const n = () => {
			const o = new kt();
			return t.stage.add(o), o;
		};
		for (const o of e) {
			const a = n();
			(this.nearStage[o.side] = a), (this.deskDust[o.side] = new Ve(a));
		}
		const i = new _(1, 1).rotateX(-Math.PI / 2);
		for (const o of ["a", "b"]) {
			const a = new gt(i, oe());
			(a.visible = !1),
				(a.renderOrder = 1),
				t.stage.add(a),
				(this.shadows[o] = a);
		}
		for (const o of e) {
			o.overlay.innerHTML = "";
			const a = document.createElement("div");
			(a.className = "dc-layer"), o.overlay.append(a), this.layers.set(o, a);
		}
	}
	get acting() {
		return this.live ? this.act : null;
	}
	setPlayers(t) {
		this.restoreHidden(), (this.players = t);
	}
	light(t) {
		(this.lit = t), this.host.dim(t);
	}
	room(t, s) {
		(this.tone = t), this.host.roomTone(t, s);
	}
	holdInput(t) {
		(this.holding = t), this.host.hold(t);
	}
	restoreRoom(t = 0.5) {
		this.lit !== 1 && this.light(1),
			this.tone !== 1 && this.room(1, t),
			this.holding && this.holdInput(!1);
	}
	get waiting() {
		return this.deciderOn;
	}
	get away() {
		return this.offDesk.size > 0 || !!this.lifts.a || !!this.lifts.b;
	}
	begin(t, s, e = !1) {
		this.finishAct(!1),
			e || this.restoreRoom(),
			(this.hushed = !1),
			(this.act = t),
			(this.T = 0),
			(this.length = s),
			(this.live = !0),
			(this.cues = []),
			this.clearLabels();
	}
	clearLabels() {
		(this.anchored = this.anchored.filter((t) => this.won.includes(t.el))),
			(this.names = []);
		for (const t of this.phones) {
			const s = this.layers.get(t);
			for (const e of [...s.children]) {
				if (!(this.won.includes(e) || this.leaving.some((n) => n.el === e))) {
					if (e.classList.contains("is-fly")) {
						this.leaving.push({ at: this.clock + 0.5, el: e });
						continue;
					}
					e.classList.contains("is-in")
						? (this.hide(e), this.leaving.push({ at: this.clock + O, el: e }))
						: e.remove();
				}
			}
		}
	}
	at(t, s, e = !1) {
		this.cues.push({ at: this.T + t, essential: e, run: s });
	}
	add(t, s, e, n = !1) {
		const i = document.createElement("div");
		return (
			(i.className = s),
			(i.innerHTML = e),
			this.layers.get(t).appendChild(i),
			n && this.anchored.push({ el: i, phone: t }),
			i
		);
	}
	show(t) {
		t.classList.remove("is-out"), t.offsetWidth, t.classList.add("is-in");
	}
	hide(t) {
		t.classList.contains("is-in") &&
			(t.classList.remove("is-in"), t.classList.add("is-out"));
	}
	drop(t) {
		t.remove(),
			(this.anchored = this.anchored.filter((s) => s.el !== t)),
			(this.names = this.names.filter((s) => s.el !== t));
	}
	name(t) {
		return this.players[t].name.toLowerCase();
	}
	bus(t) {
		return t ? void 0 : this.host.sound.bus(0.5, !0);
	}
	hush() {
		this.begin("start", 1 / 0),
			this.resetPens(),
			this.firstFlick(),
			this.clearWon(),
			this.sweepLitter(),
			this.offDesk.add("a"),
			this.offDesk.add("b"),
			this.holdInput(!0),
			this.room(0.35, 0.4),
			(this.hushed = !0);
	}
	start(t) {
		const s = !!t.together,
			e = j(t.seed),
			n = this.host,
			i = this.hushed;
		this.begin("start", 0, i),
			this.resetPens(),
			this.firstFlick(),
			this.clearWon();
		const o = n.sound,
			a = o.now() + 0.03,
			l = n.hear();
		i || this.sweepLitter();
		const c = (g) => {
				var k;
				return ((k = t.lat) == null ? void 0 : k[g]) ?? (e() < 0.5 ? 1 : -1);
			},
			h = {
				a: Z(t.entries.a, it(this.players.a.pen), c("a")),
				b: Z(t.entries.b, it(this.players.b.pen), c("b")),
			},
			u = { a: { a: 0, b: 0 }, b: { a: 0, b: 0 } },
			d = 0.12;
		for (const g of ["a", "b"]) {
			const k = g,
				q = C(g);
			if (s) {
				const b = d + Math.max(h.a.land, h.b.land);
				u[g] = { a: b, b };
			} else {
				const b = d + h[q].land,
					M = b + 0.5 + h[k].land;
				(u[g][q] = b), (u[g][k] = M);
			}
		}
		const p = Math.max(u.a.a, u.a.b, u.b.a, u.b.b) + (s ? 0.45 : 0.55),
			m = p + 0.7;
		(this.length = m + O + 0.1),
			this.holdInput(!0),
			n.reducedMotion ||
				(this.entries = {
					a: {
						plan: h.a,
						start: {
							a: this.clock + u.a.a - h.a.land,
							b: this.clock + u.b.a - h.a.land,
						},
					},
					b: {
						plan: h.b,
						start: {
							a: this.clock + u.a.b - h.b.land,
							b: this.clock + u.b.b - h.b.land,
						},
					},
				}),
			this.room(0.35, 0.3);
		for (const g of ["a", "b"]) {
			Ct(h[g], o, a + u[l][g] - h[g].land, this.bus(g === l));
		}
		if (!n.reducedMotion) {
			for (const g of ["a", "b"]) {
				for (const k of ["a", "b"]) {
					for (const q of Vt(h[k])) {
						this.at(u[g][k] - h[k].land + q.at, () => {
							var M;
							const b = this.restWorld(k, h[k], q.at);
							b &&
								(q.dust > 0 &&
									((M = this.deskDust[g]) == null ||
										M.desk(b.setY(n.desk.center.y + 0.002), q.dust)),
								q.quake > 0 && n.quake(q.quake, g));
						});
					}
				}
			}
		}
		for (const g of this.phones) {
			if (!s) {
				for (const M of [C(g.side), g.side]) {
					const L = M === g.side,
						S = this.add(
							g,
							`dc-name is-${L ? "near" : "far"}`,
							`<b>${W(this.players[M].name)}</b><i>${W(this.players[M].pen.short)}</i>`
						);
					this.names.push({ el: S, phone: g, side: M }),
						this.at(u[g.side][M], () => this.show(S)),
						this.at(m, () => this.hide(S)),
						this.at(m + O, () => this.drop(S));
				}
			}
			const k = t.tally,
				q = k
					? `<span class="dc-tally"><b>${k[g.side]}</b><i>–</i><b>${k[C(g.side)]}</b><small>${this.host.watching ? W(this.players[g.side].name) : "you"} · ${W(this.players[C(g.side)].name)}</small></span>`
					: "",
				b = this.add(g, "dc-vs", `<span class="dc-vs-word">vs</span>${q}`, !0);
			b.style.setProperty("--vs-tilt", `${-8 + e() * 6}deg`),
				b.style.setProperty("--vs-nudge", `${(e() - 0.5) * 18}px`),
				this.at(p, () => this.show(b)),
				this.at(m, () => this.hide(b)),
				this.at(m + O, () => this.drop(b));
		}
		o.thump(a + p, 1.7),
			o.boom(a + p, 1.15),
			o.slap(a + p, 1.5),
			o.hiss(a + p, 0.05, 0.3, "highpass", 3e3, 0.8),
			o.crowd("ooh", a + p + 0.06, 0.5, { fadeOut: 0.7 }),
			o.ghanta(a + m, 1),
			this.at(p, () => {
				n.quake(0.0035), n.buzz([40]);
				for (const g of Object.values(this.deskDust)) {
					g.desk(n.desk.center.clone().setY(n.desk.center.y + 0.002), 1.1);
				}
			}),
			this.at(m, () => this.holdInput(!1)),
			this.at(m + 0.15, () => this.room(1, 1.2));
	}
	restWorld(t, s, e) {
		const n = this.players[t].view();
		if (!n) {
			return null;
		}
		Bt(s, e, this.pose);
		const i = n.group,
			o = (t === "a" ? 0 : Math.PI) + Wt(i.quaternion, t === "a" ? 0 : Math.PI);
		return i.position.clone().add(Ot.copy(this.pose.pos).applyAxisAngle(U, o));
	}
	cutToPlay() {
		if (
			!this.live ||
			(this.act !== "start" && this.act !== "next" && this.act !== "decider")
		) {
			return;
		}
		(this.act === "start" ||
			(this.act === "next" && this.T < 0.25) ||
			(this.act === "decider" && this.T < 0.7)) &&
			this.host.sound.cut(),
			(this.entries = {}),
			(this.lifts = {}),
			this.offDesk.clear(),
			this.restoreHidden(),
			this.clearLabels(),
			(this.cues = []),
			this.firstFlick(),
			this.restoreRoom(0.4),
			this.finishAct(!0);
	}
	showPens() {
		(this.entries = {}),
			(this.lifts = {}),
			this.offDesk.clear(),
			(this.twirl = null),
			this.restoreHidden();
	}
	round(t) {
		const s = this.host;
		this.begin("round", 3.9), this.firstFlick();
		const e = s.sound,
			n = e.now() + 0.03,
			i = t.winner ? C(t.winner) : null,
			o = s.reducedMotion,
			a = j(t.score.a * 31 + t.score.b * 7 + 1);
		this.react(t, n), e.refWhistle(n + 0.05, [0.16, 0.16]);
		const l = !!t.winner && t.how === "flick" && t.flicks === 1;
		for (const c of this.phones) {
			const h = this.add(c, this.scoreClass(t), this.scoreHtml(c.side, t), !0);
			h.style.setProperty("--tilt", `${-7 + Math.random() * 5}deg`),
				this.at(0.35, () => this.show(h)),
				this.at(0.5, () => h.classList.add("is-hit")),
				this.at(0.72, () => h.classList.add("is-told")),
				t.winner && !o
					? this.at(1.7, () =>
							this.fly(c, h, t.winner === c.side ? "you" : "rival")
						)
					: this.at(1.7, () => this.hide(h)),
				this.at(2.35, () => this.drop(h));
		}
		if (
			(e.thump(n + 0.5, l ? 1.6 : 1.25),
			e.slap(n + 0.5, l ? 1.4 : 1.1),
			e.boom(n + 0.5, l ? 0.9 : 0.55),
			e.thump(n + 0.72, 0.6),
			e.slap(n + 0.72, 0.5),
			this.at(0.5, () => {
				s.quake(l ? 0.003 : 0.002), s.buzz(l ? [40, 60, 40] : [35]);
				for (const c of Object.values(this.deskDust)) {
					c.desk(
						s.desk.center.clone().setY(s.desk.center.y + 0.002),
						l ? 1 : 0.6
					);
				}
				this.light(0.82),
					t.winner &&
						!o &&
						(this.twirl = { at: this.clock + 0.05, side: t.winner });
			}),
			this.at(1.95, () => this.light(1)),
			i &&
				i === s.hear() &&
				e.crowd("boo", n + 0.3, 0.1, { fadeOut: 0.45, hold: 0.9 }),
			t.winner)
		) {
			o || e.whoosh(n + 1.7, 0.42, 500, 2600, 0.35);
			const c = o ? 0.6 : 2.12;
			this.at(c, () => s.boardLand(t.winner), !0),
				e.chalk(n + c, 0.3, 1.1),
				this.at(2.25, () => s.throwChalk(i));
		}
		o || this.at(3.1, () => this.liftOut(a));
	}
	liftOut(t) {
		let s = !1;
		for (const n of ["a", "b"]) {
			const i = this.shown[n];
			!i.ok ||
				this.offDesk.has(n) ||
				this.lifts[n] ||
				((this.lifts[n] = {
					at: this.clock + (n === "b" ? 0.08 : 0),
					lat: t() < 0.5 ? 1 : -1,
					pos: i.pos.clone(),
					quat: i.quat.clone(),
				}),
				(s = !0));
		}
		if (!s) {
			return;
		}
		const e = this.host.sound;
		e.tap(e.now() + 0.02, 0.18);
	}
	scoreClass(t) {
		return [
			"dc-score",
			...[
				t.winner ? "" : "is-tie",
				t.winner && t.how === "flick" && t.flicks === 1 ? "is-oneflick" : "",
			],
		]
			.filter(Boolean)
			.join(" ");
	}
	scoreHtml(t, s) {
		const e = t,
			n = C(t),
			i = (l) => {
				const c = s.winner === l,
					h = `d ${l === e ? "mine" : "theirs"}${c ? " is-hit" : ""}`;
				return c
					? `<span class="${h}"><span class="old">${s.prev[l]}</span><span class="new">${s.score[l]}</span></span>`
					: `<span class="${h}"><span class="new">${s.score[l]}</span></span>`;
			},
			o = xe(
				s,
				t,
				{ a: this.name("a"), b: this.name("b") },
				!!this.host.watching
			),
			a = Dt(s.winner, t);
		return `<div class="dc-score-line">${i(e)}<span class="dash">–</span>${i(n)}</div><div class="dc-score-story" style="--story-ink:${a}">${W(o)}</div>`;
	}
	fly(t, s, e) {
		const n = this.host.boardPoint(t.side, e);
		if (!n) {
			this.hide(s);
			return;
		}
		const i = t.rect();
		t.camera.updateMatrixWorld();
		const o = n.project(t.camera),
			a = ((o.x + 1) / 2) * i.w,
			l = ((1 - o.y) / 2) * i.h,
			c = Number.parseFloat(s.style.left) || i.w / 2,
			h = Number.parseFloat(s.style.top) || i.h / 2;
		s.style.setProperty("--fly-x", `${a - c}px`),
			s.style.setProperty("--fly-y", `${l - h}px`),
			s.classList.add("is-fly");
	}
	react(t, s) {
		const e = this.host.sound,
			n = t.winner === this.host.hear(),
			i = t.winner ? (n ? 1 : 0.5) : 0.75,
			o = !t.winner || n ? void 0 : e.bus(1, !0),
			a = t.score,
			l = (h, u) => {
				for (let d = 0; d < h; d++) {
					e.clap(
						s + 0.12 + Math.random() * 0.7,
						(0.35 + Math.random() * 0.3) * u,
						o
					);
				}
			};
		if (a.a === 2 && a.b === 2 && t.winner) {
			(this.roomCheer = e.crowd("cheer", s, 0.42 * i, {
				dest: o,
				fadeOut: 2.5,
			})),
				e.crowd("yeah", s, 0.4 * i, { dest: o });
			return;
		}
		if (!t.winner) {
			e.crowd("oh", s, 0.45 * i, { dest: o }),
				e.crowd("aww", s + 0.25, 0.25 * i, { dest: o });
			return;
		}
		if (t.how === "self") {
			e.crowd("oh", s, 0.5 * i, { dest: o, rate: 1.1 }),
				e.whistle(s + 0.35, 0.5, !0, 0.7);
			return;
		}
		if (t.flicks === 1) {
			e.crowd("ooh", s, 0.6 * i, { dest: o, fadeOut: 0.8 }),
				e.whistle(s + 0.15, -0.5),
				e.whistle(s + 0.45, 0.4, !0, 0.8),
				l(6, i);
			return;
		}
		if (a.a + a.b === 1) {
			e.crowd("ooh", s, 0.4 * i, { dest: o }), l(5, i);
			return;
		}
		if (a.a === a.b) {
			e.crowd("yeah", s, 0.5 * i, { dest: o }), l(6, i);
			return;
		}
		if (Math.abs(a.a - a.b) === 2) {
			e.crowd("oh", s, 0.5 * i, { dest: o, rate: 0.85 });
			return;
		}
		if (Math.abs(t.prev.a - t.prev.b) === 2) {
			e.crowd("yeah", s, 0.5 * i, { dest: o }),
				e.crowd("ooh", s + 0.15, 0.35 * i, { dest: o });
			return;
		}
		e.crowd("ooh", s, 0.38 * i, { dest: o });
	}
	penDown(t, s, e = ["a", "b"]) {
		const n = this.host;
		if (n.reducedMotion) {
			return;
		}
		const i = {
				a: Z(t, it(this.players.a.pen), 1),
				b: Z(t, it(this.players.b.pen), 1),
			},
			o = t === "place" ? "set" : "lay",
			a = n.sound,
			l = a.now() + 0.02;
		for (const c of e) {
			const h = s + (t === "place" && c === "b" ? 0.06 : 0),
				u = this.clock + h - i[c].land,
				d = Z(o, i[c].b, c === "a" ? 1 : -1);
			(this.entries[c] = { near: d, plan: i[c], start: { a: u, b: u } }),
				Ct(i[c], a, l + h - i[c].land, this.bus(c === n.hear()));
			for (const f of Vt(i[c])) {
				this.at(h - i[c].land + f.at, () => {
					const p = this.restWorld(c, i[c], f.at);
					if (p) {
						p.setY(n.desk.center.y + 0.002);
						for (const m of Object.values(this.deskDust)) {
							m.desk(p.clone(), f.dust);
						}
					}
				});
			}
		}
	}
	roundStart(t) {
		const s = this.host;
		this.resetPens();
		const e = ve(t, this.target);
		if (e.kind === "decider") {
			this.decider();
			return;
		}
		this.begin("next", 1.5);
		const n = e.kind === "match point" ? e.who : null,
			i = s.sound;
		this.holdInput(!0),
			this.penDown("place", 0.32),
			i.ghanta(i.now() + 0.34, 0.9);
		for (const o of this.phones) {
			const a = n
					? `<span class="dc-vs-who" style="color:${Dt(n, o.side)}">${W(this.players[n].name)}</span>`
					: "",
				l = e.kind === "round" ? `round ${e.n}` : "match point",
				c = this.add(
					o,
					`dc-vs is-title${n ? " is-mp" : ""}`,
					`${a}<span class="dc-vs-word">${l}</span>`,
					!0
				);
			c.style.setProperty("--vs-tilt", `${-7 + Math.random() * 5}deg`),
				c.style.setProperty("--vs-nudge", `${(Math.random() - 0.5) * 14}px`),
				this.at(0.34, () => this.show(c)),
				this.at(1.1, () => this.hide(c)),
				this.at(1.1 + O, () => this.drop(c));
		}
		this.at(0.34, () => {
			const o = i.now();
			i.thump(o, n ? 1.3 : 1),
				i.slap(o, n ? 1.1 : 0.9),
				n && i.boom(o, 0.6),
				s.quake(n ? 0.0026 : 0.0018),
				s.buzz([30]);
		}),
			this.at(0.42, () => this.holdInput(!1));
	}
	decider() {
		var e;
		const t = this.host,
			s = t.sound;
		this.begin("decider", 2),
			this.holdInput(!0),
			(e = this.roomCheer) == null || e.stop(0.14),
			(this.roomCheer = null),
			this.room(0.02, 0.45),
			(this.deciderOn = !0),
			this.penDown("lower", 0.62),
			this.at(0.3, () => this.light(0.6));
		for (const n of this.phones) {
			const i = this.add(
				n,
				"dc-vs is-decider",
				'<span class="dc-vs-word">decider</span>',
				!0
			);
			i.style.setProperty("--vs-tilt", `${-6 + Math.random() * 4}deg`),
				this.at(0.95, () => this.show(i)),
				this.at(1.6, () => this.hide(i)),
				this.at(1.6 + O, () => this.drop(i));
		}
		this.at(0.95, () => {
			const n = s.now();
			s.thump(n, 1.6),
				s.boom(n, 1.2),
				s.slap(n, 1.3),
				t.quake(0.003),
				t.buzz([30, 110, 45]);
		}),
			this.at(1.6, () => {
				this.holdInput(!1), (this.ticking = { n: 0, next: this.clock + 0.35 });
			});
	}
	firstFlick() {
		!(this.deciderOn || this.ticking) ||
			((this.deciderOn = !1),
			(this.ticking = null),
			this.light(1),
			this.room(1, 0.8));
	}
	end(t) {
		const s = this.host;
		this.begin("end", 3.6);
		for (const h of this.litter) {
			h.dispose();
		}
		(this.litter = []),
			this.firstFlick(),
			this.clearWon(),
			this.resetPens(),
			this.holdInput(!0);
		const { winner: e, score: n } = t,
			i = C(e),
			o = s.sound,
			a = o.now() + 0.03,
			c = s.hear() === e;
		this.celebGroup.position.copy(s.desk.center),
			this.celebGroup.rotation.set(0, e === "b" ? Math.PI : 0, 0),
			this.celebGroup.updateMatrixWorld(!0),
			o.crowd("oh", a, 0.5, { fadeOut: 0.5 });
		for (let h = 0; h < 3; h++) {
			o.ghanta(a + 0.2 + h * 0.2, 1 - h * 0.1);
		}
		c
			? (o.crowd("cheer", a + 0.32, 0.6, { fadeOut: 1.6 }),
				o.crowd("roar", a + 0.4, 0.5, { fadeOut: 1.8 }),
				o.whistle(a + 0.6, -0.6, !0),
				o.whistle(a + 0.9, 0.5))
			: (o.crowd("aww", a + 0.3, 0.55, { fadeOut: 1 }),
				o.crowd("cheer", a + 0.35, 0.2, { fadeOut: 1.4 })),
			t.fromRound && this.at(0.1, () => s.boardLand(e), !0),
			this.at(t.fromRound ? 1.15 : 0.4, () => s.boardRing(e)),
			s.reducedMotion ||
				(this.at(0.55, () => {
					this.trophy = { at: this.clock, side: e };
				}),
				o.whoosh(a + 0.55, 0.7, 300, 2200, 0.35),
				o.shimmer(a + 1.2, 1.2));
		for (const h of this.phones) {
			const u = this.add(
				h,
				`dc-won ${h.side === e ? "is-you" : "is-them"}`,
				this.wonHtml(e, n)
			);
			(u.dataset.phone = h.side),
				this.won.push(u),
				this.at(1.15, () => this.show(u)),
				this.at(1.32, () => u.classList.add("is-told")),
				this.at(h.side === e ? 2.4 : 1.4, () => s.sheet(h, e, n));
		}
		o.thump(a + 1.15, 1.5),
			o.slap(a + 1.15, 1.3),
			o.boom(a + 1.15, 0.8),
			o.thump(a + 1.32, 0.7),
			this.at(1.15, () => {
				s.quake(0.0028), s.buzz([45]);
			}),
			this.at(0.3, () => {
				if (s.reducedMotion) {
					return;
				}
				const h = (p) => this.celebGroup.worldToLocal(p.clone()),
					u = this.players[e].view(),
					d = this.phones.length
						? h(s.eye(this.phones[0]))
						: new y(0, 0.84, 0.58);
				this.phones[0] && this.phones[0].side !== e && d.set(-d.x, d.y, -d.z);
				const f = {
					boardBottom: s.board.bottom - s.desk.center.y,
					boardTop: s.board.top - s.desk.center.y,
					boardZ: h(new y(0, s.board.bottom, s.board.z)).z,
					bumpPen: (p, m) => this.bump(p === "winner" ? e : i, m),
					desk: { d: s.desk.d, w: s.desk.w },
					eye: d,
					group: this.celebGroup,
					near: c,
					quake: (p) => s.quake(p),
					sound: o,
					tube: (p) => this.light(p >= 1 ? 1 : 0.9 + p * 0.1),
					winnerPen: u
						? h(u.group.getWorldPosition(new y()))
						: new y(0, 0, s.desk.d * 0.28),
				};
				t.celebrations.forEach((p, m) =>
					this.celebrations.push(Fe(p, f, t.seed + m * 101))
				),
					s.buzz(c ? [30, 50, 30, 50, 80] : [25]);
			});
	}
	wonHtml(t, s) {
		const e = this.players[t];
		return `<div class="dc-won-name">${W(e.name)}</div><div class="dc-won-score">won ${s[t]}–${s[C(t)]}</div>`;
	}
	settle() {
		for (const t of this.won) {
			this.hide(t), this.leaving.push({ at: this.clock + O, el: t });
		}
		if (
			((this.anchored = this.anchored.filter((t) => !this.won.includes(t.el))),
			(this.won = []),
			this.trophy)
		) {
			const t = this.trophy.side,
				s = this.shown[t];
			s.ok &&
				(this.returning = {
					at: this.clock,
					pos: s.pos.clone(),
					quat: s.quat.clone(),
					side: t,
				}),
				this.penDown("place", 0.32, [C(t)]);
		}
		(this.trophy = null), this.restoreRoom();
	}
	clearWon() {
		for (const t of this.won) {
			t.remove();
		}
		(this.anchored = this.anchored.filter((t) => !this.won.includes(t.el))),
			(this.won = []);
	}
	sweepLitter() {
		for (const s of this.litter) {
			s.sweep();
		}
		const t = this.litter;
		(this.litter = []),
			window.setTimeout(() => t.forEach((s) => s.dispose()), 900);
	}
	sweep() {
		this.sweepLitter(), this.resetPens(), this.firstFlick(), this.clearWon();
	}
	resetPens() {
		(this.entries = {}),
			(this.lifts = {}),
			this.offDesk.clear(),
			(this.returning = null),
			(this.trophy = null),
			(this.twirl = null),
			this.restoreHidden();
	}
	conceal(t, s) {
		s.visible && this.hidden.add(t), (s.visible = !1);
	}
	reveal(t, s) {
		this.hidden.has(t) && ((s.visible = !0), this.hidden.delete(t));
	}
	remember(t, s) {
		const e = this.shown[t];
		e.pos.copy(s.position), e.quat.copy(s.quaternion), (e.ok = !0);
	}
	dropShadow(t, s, e, n) {
		const i = this.shadows[t];
		if (!i) {
			return;
		}
		const o = 0.34 * K((e - 0.004) / 0.03) * (1 - K((e - 0.18) / 0.8));
		if (o <= 0.01) {
			return;
		}
		const a = 1 + 1.2 * e;
		Y.set(1, 0, 0).applyQuaternion(s.quaternion),
			i.position.set(
				s.position.x,
				this.host.desk.center.y + 0.0011,
				s.position.z
			),
			i.rotation.set(0, Math.atan2(-Y.z, Y.x), 0),
			i.scale.set(n.halfLen * 2.15 * a, 1, n.radius * 7 * a),
			(i.material.opacity = o),
			(i.visible = !0);
	}
	restoreHidden() {
		for (const t of this.hidden) {
			const s = this.players[t].view();
			s && (s.group.visible = !0);
		}
		this.hidden.clear();
	}
	bump(t, s) {
		const e = this.bumps[t];
		(e.amp = Math.min(1.2, Math.max(e.amp, s))), (e.t = 0);
	}
	apply(t, s) {
		for (const e of ["a", "b"]) {
			const n = this.players[e].view();
			if ((this.shadows[e] && (this.shadows[e].visible = !1), !n)) {
				continue;
			}
			const i = n.group,
				o = this.lifts[e];
			if (o) {
				const c = (this.clock - o.at) / Ee;
				if (c >= 1) {
					delete this.lifts[e], this.offDesk.add(e);
				} else {
					const h = Math.max(0, c) ** 2,
						u = De[e];
					this.reveal(e, i),
						i.position.copy(o.pos),
						(i.position.y += u.rise * h),
						(i.position.z += (e === "a" ? 1 : -1) * u.back * h),
						i.quaternion
							.copy(o.quat)
							.premultiply(H.setFromAxisAngle(U, o.lat * u.turn * h)),
						this.remember(e, i);
					continue;
				}
			}
			const a = this.entries[e];
			if (!a && this.offDesk.has(e)) {
				this.conceal(e, i);
				continue;
			}
			if (a) {
				const c = this.clock - a.start[t];
				if (c < 0) {
					this.conceal(e, i);
					continue;
				}
				this.offDesk.delete(e), this.reveal(e, i);
				const h = a.near && e === t ? a.near : a.plan;
				if (c < h.done) {
					const u = Bt(h, c, this.pose),
						d = e === "a" ? 0 : Math.PI,
						f = d + Wt(i.quaternion, d);
					ht.setFromAxisAngle(U, f),
						$t.copy(ht).invert(),
						i.position.add(Ot.copy(u.pos).applyQuaternion(ht)),
						i.quaternion.premultiply(H.copy(ht).multiply(u.quat).multiply($t)),
						c < h.land &&
							h.kind !== "set" &&
							h.kind !== "lay" &&
							this.dropShadow(e, i, u.pos.y, h.b);
				}
			}
			if (this.twirl && this.twirl.side === e) {
				const c = (this.clock - this.twirl.at) / 0.5;
				c > 0 &&
					c < 1 &&
					((i.position.y += 0.022 * Math.sin(Math.PI * c)),
					i.quaternion.premultiply(
						H.setFromAxisAngle(U, 2 * Math.PI * c * c * (3 - 2 * c))
					));
			}
			if (this.trophy && this.trophy.side === e && s) {
				const c = this.clock - this.trophy.at,
					h = 1 - (1 - K(c / 0.8)) ** 3,
					u = this.host.trophyTarget(s);
				u.y += 0.006 * Math.sin(c * 2.3) * h;
				const d = i.parent;
				d && d.parent && (d.updateWorldMatrix(!0, !1), d.worldToLocal(u)),
					i.position.lerp(u, h),
					Gt.setFromAxisAngle(
						U,
						0.22 * Math.sin(c * 0.9) + (t === "b" ? Math.PI : 0)
					).multiply(H.setFromAxisAngle(Ge, c * 1.5)),
					i.quaternion.slerp(Gt, h);
			}
			if (this.returning && this.returning.side === e) {
				const c = this.returning,
					h = K((this.clock - c.at) / $e),
					u = Ce(h);
				i.position.lerpVectors(c.pos, i.position, u),
					H.copy(i.quaternion),
					i.quaternion.copy(c.quat).slerp(H, u),
					h >= 1 && (this.returning = null);
			}
			const l = this.bumps[e];
			if (l.amp > 0) {
				const c = l.amp * Math.exp(-l.t / 0.12);
				(i.position.y += 0.004 * c * Math.abs(Math.sin(l.t * 40))),
					i.quaternion.multiply(
						H.setFromAxisAngle(U, 0.08 * c * Math.sin(l.t * 31))
					);
			}
			this.remember(e, i);
		}
		for (const e of ["a", "b"]) {
			const n = this.nearStage[e];
			n && (n.visible = e === t);
		}
		if (s && (this.place(s), this.won.length && this.host.wonAt)) {
			const e = this.host.wonAt(s);
			if (e) {
				for (const n of this.won) {
					n.dataset.phone === s.side &&
						((n.style.top = `${e.top}px`),
						(n.style.left = e.left === void 0 ? "" : `${e.left}px`));
				}
			}
		}
	}
	update(t) {
		var s, e;
		if (((this.clock += t), this.leaving.length)) {
			const n = this.leaving.filter((i) => this.clock >= i.at);
			if (n.length) {
				for (const i of n) {
					this.drop(i.el);
				}
				this.leaving = this.leaving.filter((i) => this.clock < i.at);
			}
		}
		if (this.live) {
			this.T += t;
			for (const n of [...this.cues]) {
				!n.done && this.T >= n.at && ((n.done = !0), n.run());
			}
		}
		for (const n of ["a", "b"]) {
			const i = this.bumps[n];
			i.amp > 0 &&
				((i.t += t), i.amp * Math.exp(-i.t / 0.12) < 0.01 && (i.amp = 0)),
				(s = this.deskDust[n]) == null || s.update(t);
		}
		for (const n of this.celebrations) {
			n.update(t);
		}
		for (const n of this.litter) {
			n.update(t);
		}
		for (const n of ["a", "b"]) {
			const i = this.entries[n],
				o = Math.max(
					(i == null ? void 0 : i.plan.done) ?? 0,
					((e = i == null ? void 0 : i.near) == null ? void 0 : e.done) ?? 0
				);
			i &&
				Math.max(i.start.a, i.start.b) + o < this.clock &&
				delete this.entries[n];
		}
		if (this.ticking && this.clock >= this.ticking.next - 0.05) {
			const n = this.host.sound;
			n.tick(
				n.now() + Math.max(0, this.ticking.next - this.clock),
				this.ticking.n % 2 === 1,
				1
			),
				this.ticking.n++,
				(this.ticking.next += 1),
				this.ticking.n > 20 && (this.ticking = null);
		}
		this.live && this.T >= this.length && this.finishAct(!0);
	}
	place(t) {
		if (!(this.anchored.length || this.names.length)) {
			return;
		}
		const s = t.rect();
		t.camera.updateMatrixWorld();
		const e = this.host.desk.center.clone();
		e.y += 0.01;
		const n = this.host.stage;
		n.parent && (n.updateWorldMatrix(!0, !1), n.localToWorld(e)),
			e.project(t.camera);
		const i = Math.round(((e.x + 1) / 2) * s.w),
			o = Math.round(((1 - e.y) / 2) * s.h);
		for (const c of this.anchored) {
			c.phone === t && Ht(c.el, i, o);
		}
		const a = s.w > s.h && s.h <= 560,
			l = 0.17 * Math.min(s.w, s.h);
		for (const c of this.names) {
			c.phone === t &&
				(c.el.classList.contains("is-row") !== a &&
					c.el.classList.toggle("is-row", a),
				a
					? Ht(c.el, Math.round(c.side === t.side ? i + l : i - l), o)
					: mt.has(c.el) &&
						(mt.delete(c.el), (c.el.style.left = ""), (c.el.style.top = "")));
		}
	}
	skip() {
		if (this.live) {
			this.host.sound.hush();
			for (const t of this.cues) {
				t.done || ((t.done = !0), t.run());
			}
			this.host.sound.cut(0.02),
				(this.entries = {}),
				(this.lifts = {}),
				this.offDesk.clear(),
				this.restoreHidden(),
				this.finishAct(!0);
		}
	}
	finishAct(t, s = !0) {
		if (this.live) {
			if (!t && s) {
				for (const e of this.cues) {
					!e.done && e.essential && ((e.done = !0), e.run());
				}
			}
			(this.live = !1),
				this.litter.push(...this.celebrations),
				(this.celebrations = []),
				(this.act = null);
		}
	}
	dispose() {
		this.finishAct(!1, !1),
			this.host.sound.cut(),
			(this.roomCheer = null),
			this.firstFlick(),
			this.restoreRoom(0.3),
			(this.trophy = null),
			(this.twirl = null),
			(this.returning = null),
			(this.entries = {}),
			(this.lifts = {}),
			this.offDesk.clear(),
			this.restoreHidden(),
			(this.leaving = []);
		for (const t of Object.values(this.shadows)) {
			t &&
				(this.host.stage.remove(t), t.geometry.dispose(), t.material.dispose());
		}
		this.shadows = {};
		for (const t of [...this.celebrations, ...this.litter]) {
			t.dispose();
		}
		(this.celebrations = []), (this.litter = []), (this.ticking = null);
		for (const t of Object.values(this.deskDust)) {
			t.dispose();
		}
		for (const t of Object.values(this.nearStage)) {
			this.host.stage.remove(t);
		}
		(this.deskDust = {}),
			(this.nearStage = {}),
			this.host.stage.remove(this.celebGroup);
		for (const t of this.phones) {
			t.overlay.innerHTML = "";
		}
	}
}
const Nt = {
	aww: "/assets/crowd-aww.mp3",
	boo: "/assets/boo.mp3",
	cheer: "/assets/cheer.mp3",
	hubbub: "/assets/school-hubbub.mp3",
	oh: "/assets/crowd-oh.mp3",
	ooh: "/assets/crowd-ooh.mp3",
	roar: "/assets/crowd-roar.mp3",
	yeah: "/assets/crowd-yeah.mp3",
};
class We {
	constructor() {
		w(this, "ctx", null);
		w(this, "out", null);
		w(this, "noiseBuf", null);
		w(this, "verbIn", null);
		w(this, "buffers", new Map());
		w(this, "loading", new Set());
		w(this, "beds", []);
		w(this, "act", null);
		w(this, "level", 0.9);
		w(this, "muted", !1);
	}
	async unlock() {
		if (!this.ctx) {
			const t = window.AudioContext ?? window.webkitAudioContext;
			if (!t) {
				return !1;
			}
			this.ctx = new t();
			const s = this.ctx.createDynamicsCompressor();
			(s.threshold.value = -14),
				(s.knee.value = 10),
				(s.ratio.value = 4),
				(s.attack.value = 0.004),
				(s.release.value = 0.18),
				(this.out = this.ctx.createGain()),
				(this.out.gain.value = this.muted ? 0 : this.level),
				this.out.connect(s).connect(this.ctx.destination);
			const e = this.ctx.createConvolver();
			(e.buffer = this.impulse(3.2)),
				(this.verbIn = this.ctx.createGain()),
				(this.verbIn.gain.value = 1),
				this.verbIn.connect(e).connect(this.out);
			const n = this.ctx.sampleRate * 2;
			this.noiseBuf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
			const i = this.noiseBuf.getChannelData(0);
			for (let o = 0; o < n; o++) {
				i[o] = Math.random() * 2 - 1;
			}
			this.prepare(Object.keys(Nt));
		}
		if (this.ctx.state !== "running") {
			try {
				await this.ctx.resume();
			} catch {
				return !1;
			}
		}
		return this.ctx.state === "running";
	}
	attach(t, s, e = 0.8) {
		if (this.ctx === t) {
			return;
		}
		(this.ctx = t),
			(this.level = e),
			(this.act = null),
			(this.out = t.createGain()),
			(this.out.gain.value = this.muted ? 0 : e),
			this.out.connect(s);
		const n = t.createConvolver();
		(n.buffer = this.impulse(3.2)),
			(this.verbIn = t.createGain()),
			(this.verbIn.gain.value = 1),
			this.verbIn.connect(n).connect(this.out);
		const i = t.sampleRate * 2;
		this.noiseBuf = t.createBuffer(1, i, t.sampleRate);
		const o = this.noiseBuf.getChannelData(0);
		for (let a = 0; a < i; a++) {
			o[a] = Math.random() * 2 - 1;
		}
	}
	get ready() {
		return !!this.ctx && this.ctx.state === "running";
	}
	actNodes() {
		if (this.act) {
			return this.act;
		}
		const t = this.ctx,
			s = t.createGain();
		s.connect(this.out);
		let e = null;
		return (
			this.verbIn && ((e = t.createGain()), e.connect(this.verbIn)),
			(this.act = { dry: s, wet: e }),
			this.act
		);
	}
	dry() {
		return this.actNodes().dry;
	}
	wet() {
		return this.actNodes().wet;
	}
	cut(t = 0.04) {
		const s = this.act,
			e = this.ctx;
		if (((this.act = null), !(s && e))) {
			return;
		}
		const n = e.currentTime;
		for (const i of [s.dry, s.wet]) {
			i &&
				(i.gain.cancelScheduledValues(n),
				i.gain.setValueAtTime(i.gain.value, n),
				i.gain.linearRampToValueAtTime(0, n + t));
		}
		window.setTimeout(
			() => {
				var i;
				try {
					s.dry.disconnect();
				} catch {}
				try {
					(i = s.wet) == null || i.disconnect();
				} catch {}
			},
			(t + 0.1) * 1e3
		);
	}
	impulse(t) {
		const s = this.ctx,
			e = Math.floor(s.sampleRate * t),
			n = s.createBuffer(2, e, s.sampleRate),
			i = Math.floor(s.sampleRate * 0.018),
			o = e - i,
			a = 64,
			l = (c) => {
				const h = Math.min(1, (c - i) / o);
				return (1 - h) ** 3.2 * (0.6 + 0.4 * Math.exp(-h * 9));
			};
		for (let c = 0; c < 2; c++) {
			const h = n.getChannelData(c);
			for (let u = i; u < e; u += a) {
				const d = l(u),
					f = l(Math.min(e, u + a)),
					p = Math.min(e, u + a);
				for (let m = u; m < p; m++) {
					h[m] = (Math.random() * 2 - 1) * (d + (f - d) * ((m - u) / a));
				}
			}
		}
		return n;
	}
	send(t, s = 1) {
		const e = this.ctx,
			n = e.createGain(),
			i = e.createGain();
		if (
			((i.gain.value = s),
			n.connect(i).connect(this.dry()),
			this.verbIn && t > 0)
		) {
			const o = e.createGain();
			(o.gain.value = t), n.connect(o).connect(this.wet() ?? this.verbIn);
		}
		return n;
	}
	setMuted(t) {
		(this.muted = t),
			this.out &&
				this.ctx &&
				this.out.gain.setTargetAtTime(
					t ? 0 : this.level,
					this.ctx.currentTime,
					0.03
				);
	}
	prepare(t) {
		const s = this.ctx;
		if (s) {
			for (const e of t) {
				this.buffers.has(e) ||
					this.loading.has(e) ||
					(this.loading.add(e),
					fetch(Nt[e])
						.then((n) => n.arrayBuffer())
						.then((n) => s.decodeAudioData(n))
						.then((n) => {
							this.buffers.set(e, n);
						})
						.catch(() => {
							this.loading.delete(e);
						}));
			}
		}
	}
	has(t) {
		return this.buffers.has(t);
	}
	now() {
		var t;
		return ((t = this.ctx) == null ? void 0 : t.currentTime) ?? 0;
	}
	env(t, s, e, n, i) {
		const a = this.ctx.createGain();
		return (
			a.gain.setValueAtTime(1e-4, t),
			a.gain.exponentialRampToValueAtTime(Math.max(s, 2e-4), t + e),
			a.gain.exponentialRampToValueAtTime(1e-4, t + e + n),
			a.connect(i ?? this.dry()),
			a
		);
	}
	tone(t, s, e, n, i, o, a, l, c = 0) {
		if (!this.ctx) {
			return;
		}
		const u = this.ctx.createOscillator();
		(u.type = s),
			u.frequency.setValueAtTime(e, t),
			n !== e && u.frequency.exponentialRampToValueAtTime(n, t + i);
		const d = this.env(t, o, 0.004, a, c ? this.panner(c, l) : l);
		u.connect(d), u.start(t), u.stop(t + a + 0.05);
	}
	panner(t, s) {
		const e = this.ctx.createStereoPanner();
		return (e.pan.value = t), e.connect(s ?? this.dry()), e;
	}
	hiss(t, s, e, n, i, o = 1, a, l = 0.002) {
		if (!this.ctx) {
			return;
		}
		const c = this.ctx,
			h = c.createBufferSource();
		h.buffer = this.noiseBuf;
		const u = c.createBiquadFilter();
		(u.type = n), (u.frequency.value = i), (u.Q.value = o);
		const d = this.env(t, e, l, s, a);
		h.connect(u).connect(d),
			h.start(t, Math.random() * 1.5),
			h.stop(t + l + s + 0.05);
	}
	thump(t, s = 1, e) {
		this.ctx &&
			(this.tone(t, "sine", 128, 46, 0.2, 0.55 * s, 0.32, e),
			this.tone(t, "triangle", 230, 170, 0.06, 0.12 * s, 0.09, e),
			this.hiss(t, 0.05, 0.12 * s, "lowpass", 420, 0.7, e));
	}
	slap(t, s = 1, e) {
		this.ctx &&
			(this.hiss(t, 0.08, 0.32 * s, "bandpass", 1700, 1.1, e),
			this.tone(t, "triangle", 210, 160, 0.05, 0.12 * s, 0.07, e));
	}
	tap(t, s = 1, e) {
		this.ctx &&
			(this.hiss(t, 0.025, 0.16 * s, "highpass", 3600, 0.8, e),
			this.tone(t, "sine", 1900, 1700, 0.02, 0.05 * s, 0.03, e));
	}
	clap(t, s = 1, e) {
		if (this.ctx) {
			for (let n = 0; n < 3; n++) {
				this.hiss(
					t + n * 0.009 + Math.random() * 0.003,
					0.012,
					0.2 * s,
					"bandpass",
					1150,
					0.9,
					e
				);
			}
			this.hiss(t + 0.027, 0.09, 0.14 * s, "bandpass", 1300, 0.7, e);
		}
	}
	stomp(t, s = 1, e) {
		this.ctx &&
			(this.tone(t, "sine", 82, 36, 0.22, 0.7 * s, 0.4, e),
			this.hiss(t, 0.14, 0.18 * s, "lowpass", 200, 0.7, e));
	}
	knock(t, s = 1, e) {
		this.ctx &&
			(this.tone(t, "sine", 290, 205, 0.06, 0.42 * s, 0.12, e),
			this.hiss(t, 0.03, 0.2 * s, "bandpass", 950, 1.4, e));
	}
	whistle(t, s = 0, e = !1, n = 1) {
		if (!this.ctx) {
			return;
		}
		const i = this.ctx,
			o = i.createOscillator();
		o.type = "sine";
		const a = 2350 + Math.random() * 300;
		o.frequency.setValueAtTime(a * 0.78, t),
			o.frequency.exponentialRampToValueAtTime(a * 1.18, t + 0.13),
			e &&
				(o.frequency.setValueAtTime(a * 1.18, t + 0.2),
				o.frequency.exponentialRampToValueAtTime(a * 0.62, t + 0.62));
		const l = i.createOscillator();
		l.frequency.value = 7;
		const c = i.createGain();
		(c.gain.value = 28), l.connect(c).connect(o.frequency);
		const h = e ? 0.66 : 0.42,
			u = this.env(t, 0.075 * n, 0.03, h, this.panner(s));
		o.connect(u),
			o.start(t),
			l.start(t),
			o.stop(t + h + 0.08),
			l.stop(t + h + 0.08),
			this.hiss(t, h, 0.012 * n, "bandpass", a, 6, this.panner(s), 0.03);
	}
	boom(t, s = 1, e) {
		this.ctx &&
			(this.tone(t, "sine", 64, 27, 0.5, 0.75 * s, 0.85, e),
			this.hiss(t, 0.22, 0.1 * s, "lowpass", 160, 0.7, e));
	}
	landing(t, s, e) {
		if (!this.ctx) {
			return;
		}
		const n = 0.6 + s.heavy * 0.6;
		if (s.tri) {
			this.hiss(t, 0.05, 0.42, "bandpass", 1450, 1.6, e),
				this.tone(t, "triangle", 620, 540, 0.04, 0.22, 0.09, e);
			return;
		}
		this.hiss(t, 0.035, 0.36 * n, "bandpass", s.metal ? 3100 : 2300, 1.4, e),
			this.tone(
				t,
				"triangle",
				480 - s.heavy * 120,
				380 - s.heavy * 90,
				0.04,
				0.2 * n,
				0.08,
				e
			),
			s.metal &&
				(this.tone(t, "sine", 3260, 3260, 0, 0.05, 0.42, e),
				this.tone(t, "sine", 4870, 4870, 0, 0.03, 0.3, e));
		const i = 1 + Math.round(s.springy * 3);
		let o = t,
			a = 0.1 + s.springy * 0.06,
			l = 0.5 * n;
		for (let c = 0; c < i; c++) {
			(o += a),
				(a *= 0.62),
				(l *= 0.55),
				this.hiss(o, 0.02, 0.3 * l, "bandpass", s.metal ? 3300 : 2500, 1.6, e);
		}
	}
	whoosh(t, s = 0.3, e = 600, n = 5200, i = 1, o = 0, a) {
		if (!this.ctx) {
			return;
		}
		const l = this.ctx,
			c = l.createBufferSource();
		c.buffer = this.noiseBuf;
		const h = l.createBiquadFilter();
		(h.type = "bandpass"),
			(h.Q.value = 2.2),
			h.frequency.setValueAtTime(e, t),
			h.frequency.exponentialRampToValueAtTime(n, t + s);
		const u = l.createGain();
		u.gain.setValueAtTime(1e-4, t),
			u.gain.exponentialRampToValueAtTime(0.22 * i, t + s * 0.75),
			u.gain.exponentialRampToValueAtTime(1e-4, t + s + 0.05),
			c
				.connect(h)
				.connect(u)
				.connect(o ? this.panner(o, a) : (a ?? this.dry())),
			c.start(t, Math.random()),
			c.stop(t + s + 0.1);
	}
	skid(t, s, e = 2400, n = 1, i) {
		if (!this.ctx) {
			return;
		}
		const o = this.ctx,
			a = o.createBufferSource();
		a.buffer = this.noiseBuf;
		const l = o.createBiquadFilter();
		(l.type = "bandpass"),
			(l.Q.value = 1.4),
			l.frequency.setValueAtTime(e, t),
			l.frequency.exponentialRampToValueAtTime(e * 0.45, t + s);
		const c = o.createGain();
		c.gain.setValueAtTime(1e-4, t),
			c.gain.exponentialRampToValueAtTime(0.2 * n, t + 0.02),
			c.gain.exponentialRampToValueAtTime(1e-4, t + s),
			a
				.connect(l)
				.connect(c)
				.connect(i ?? this.dry()),
			a.start(t, Math.random()),
			a.stop(t + s + 0.05);
	}
	whirr(t, s, e = 190, n = 70, i, o = 1) {
		if (!this.ctx) {
			return;
		}
		const a = this.ctx,
			l = a.createOscillator();
		(l.type = "sawtooth"),
			l.frequency.setValueAtTime(e, t),
			l.frequency.exponentialRampToValueAtTime(n, t + s);
		const c = a.createBiquadFilter();
		(c.type = "lowpass"),
			c.frequency.setValueAtTime(1400, t),
			c.frequency.exponentialRampToValueAtTime(500, t + s);
		const h = a.createOscillator();
		h.frequency.setValueAtTime(9, t),
			h.frequency.linearRampToValueAtTime(3, t + s);
		const u = a.createGain();
		u.gain.value = 0.05;
		const d = a.createGain();
		d.gain.setValueAtTime(1e-4, t),
			d.gain.exponentialRampToValueAtTime(0.09 * o, t + 0.05),
			d.gain.setValueAtTime(0.09 * o, t + s * 0.8),
			d.gain.exponentialRampToValueAtTime(1e-4, t + s),
			h.connect(u).connect(d.gain),
			l
				.connect(c)
				.connect(d)
				.connect(i ?? this.dry()),
			l.start(t),
			h.start(t),
			l.stop(t + s + 0.05),
			h.stop(t + s + 0.05);
	}
	roll(t, s, e) {
		if (this.ctx) {
			this.hiss(t, s, 0.09, "lowpass", 520, 0.9, e);
			for (let n = 0; n < 5; n++) {
				this.hiss(
					t + s * (n / 5) * (0.7 + n * 0.06),
					0.015,
					0.06 * (1 - n / 6),
					"bandpass",
					1800,
					1.5,
					e
				);
			}
		}
	}
	chalk(t, s, e = 1, n) {
		if (!this.ctx) {
			return;
		}
		const i = this.ctx,
			o = i.createBufferSource();
		o.buffer = this.noiseBuf;
		const a = i.createBiquadFilter();
		(a.type = "highpass"), (a.frequency.value = 900);
		const l = i.createBiquadFilter();
		(l.type = "bandpass"),
			(l.frequency.value = 2500 + Math.random() * 800),
			(l.Q.value = 0.9);
		const c = i.createGain();
		c.gain.setValueAtTime(1e-4, t);
		const h = Math.max(4, Math.floor(s / 0.011));
		for (let u = 1; u <= h; u++) {
			const d = u / h,
				f = Math.sin(Math.PI * Math.min(1, d * 1.05));
			c.gain.linearRampToValueAtTime(
				(0.05 + Math.random() * 0.17) * e * (0.35 + 0.65 * f),
				t + d * s
			);
		}
		if (
			(c.gain.linearRampToValueAtTime(1e-4, t + s + 0.02),
			o
				.connect(a)
				.connect(l)
				.connect(c)
				.connect(n ?? this.dry()),
			o.start(t, Math.random()),
			o.stop(t + s + 0.06),
			this.hiss(t, 0.012, 0.12 * e, "bandpass", 1800, 1.5, n),
			Math.random() < 0.5)
		) {
			const u = t + s * (0.15 + Math.random() * 0.4),
				d = Math.min(0.11, s * 0.5),
				f = 2700 + Math.random() * 900,
				p = i.createOscillator();
			(p.type = "sine"),
				p.frequency.setValueAtTime(f, u),
				p.frequency.linearRampToValueAtTime(
					f * (1 + (Math.random() - 0.5) * 0.08),
					u + d
				);
			const m = i.createOscillator();
			m.frequency.value = 38;
			const g = i.createGain();
			(g.gain.value = 60),
				m.connect(g).connect(p.frequency),
				p.connect(this.env(u, 0.03 * e, 0.01, d, n)),
				p.start(u),
				m.start(u),
				p.stop(u + d + 0.05),
				m.stop(u + d + 0.05);
		}
	}
	tick(t, s = !1, e = 1) {
		this.ctx &&
			(this.hiss(t, 0.006, 0.1 * e, "bandpass", s ? 2500 : 3300, 4),
			this.tone(
				t,
				"sine",
				s ? 1180 : 1420,
				s ? 1150 : 1390,
				0.01,
				0.045 * e,
				0.04
			),
			this.tone(t, "triangle", 380, 340, 0.01, 0.03 * e, 0.06));
	}
	refWhistle(t, s, e = 0.07, n = 1) {
		if (!this.ctx) {
			return;
		}
		const i = this.ctx;
		let o = t;
		for (const a of s) {
			const l = 2900 + Math.random() * 140,
				c = i.createGain();
			c.gain.setValueAtTime(1e-4, o),
				c.gain.linearRampToValueAtTime(0.085 * n, o + 0.014),
				c.gain.setValueAtTime(0.085 * n, o + Math.max(0.02, a - 0.05)),
				c.gain.exponentialRampToValueAtTime(1e-4, o + a);
			const h = i.createOscillator();
			(h.type = "square"), (h.frequency.value = 32 + Math.random() * 8);
			const u = i.createGain();
			(u.gain.value = 150), h.connect(u);
			const d = i.createGain();
			d.gain.value = 0.75;
			const f = i.createGain();
			(f.gain.value = 0.25),
				h.connect(f).connect(d.gain),
				c.connect(d).connect(this.send(0.12));
			for (const [p, m] of [
				[1, 1],
				[2.01, 0.28],
			]) {
				const g = i.createOscillator();
				(g.type = "sine"),
					g.frequency.setValueAtTime(l * p, o),
					u.connect(g.frequency);
				const k = i.createGain();
				(k.gain.value = m),
					g.connect(k).connect(c),
					g.start(o),
					g.stop(o + a + 0.05);
			}
			h.start(o),
				h.stop(o + a + 0.05),
				this.hiss(o, a, 0.018 * n, "bandpass", l, 2.5, void 0, 0.01),
				(o += a + e);
		}
	}
	bus(t, s = !1) {
		if (!(this.ctx && this.out)) {
			return;
		}
		const e = this.ctx.createGain();
		if (((e.gain.value = t), !s)) {
			return e.connect(this.dry()), e;
		}
		const n = this.ctx.createBiquadFilter();
		return (
			(n.type = "lowpass"),
			(n.frequency.value = 2600),
			e.connect(n).connect(this.dry()),
			e
		);
	}
	shimmer(t, s) {
		if (!this.ctx) {
			return;
		}
		const e = [1318, 1568, 1976, 2349, 2637, 3136],
			n = this.send(0.7, 0.6);
		for (let i = 0; i < 12; i++) {
			const o = t + (i / 12) * s,
				a = e[i % e.length] * (i % 2 ? 1 : 2);
			this.tone(o, "sine", a, a, 0, 0.035, 0.5, n, (i % 3) - 1);
		}
	}
	ghanta(t, s = 1) {
		if (!this.ctx) {
			return;
		}
		const e = [
				[1, 1, 2.8],
				[1.004, 0.5, 2.6],
				[1.47, 0.55, 1.9],
				[2.09, 0.45, 1.5],
				[2.56, 0.3, 1.1],
				[3.18, 0.22, 0.8],
				[4.07, 0.14, 0.55],
			],
			n = 512;
		for (const [i, o, a] of e) {
			this.tone(t, "sine", n * i, n * i, 0, 0.11 * o * s, a);
		}
		this.hiss(t, 0.04, 0.22 * s, "bandpass", 3400, 1.2),
			this.tone(t, "sine", 180, 120, 0.08, 0.2 * s, 0.12);
	}
	crowd(t, s, e, n = {}) {
		const i = this.ctx,
			o = this.buffers.get(t);
		if (!(i && o)) {
			return { stop: () => {} };
		}
		const a = i.createBufferSource();
		(a.buffer = o), (a.playbackRate.value = n.rate ?? 1);
		const l = i.createGain(),
			c = n.fadeIn ?? 0.02,
			h = n.fadeOut ?? 0.6,
			u = o.duration / (n.rate ?? 1) - (n.offset ?? 0),
			d = n.hold ?? Math.max(0.1, u - c - h);
		return (
			l.gain.setValueAtTime(1e-4, s),
			l.gain.exponentialRampToValueAtTime(e, s + c),
			l.gain.setValueAtTime(e, s + c + d),
			l.gain.exponentialRampToValueAtTime(1e-4, s + c + d + h),
			a
				.connect(l)
				.connect(n.pan ? this.panner(n.pan, n.dest) : (n.dest ?? this.dry())),
			a.start(s, n.offset ?? 0),
			a.stop(s + c + d + h + 0.1),
			{
				stop: (f = 0.15) => {
					const p = i.currentTime;
					if (p < s) {
						try {
							a.stop();
						} catch {}
						return;
					}
					l.gain.cancelScheduledValues(p),
						l.gain.setValueAtTime(Math.max(l.gain.value, 1e-4), p),
						l.gain.exponentialRampToValueAtTime(1e-4, p + f);
					try {
						a.stop(p + f + 0.05);
					} catch {}
				},
			}
		);
	}
	murmur(t, s) {
		const e = this.ctx,
			n = this.buffers.get("hubbub");
		if (!(e && n)) {
			return { set: () => {}, stop: () => {} };
		}
		const i = e.createBufferSource();
		(i.buffer = n), (i.loop = !0);
		const o = e.createGain();
		o.gain.setValueAtTime(1e-4, t),
			o.gain.exponentialRampToValueAtTime(Math.max(s, 2e-4), t + 0.4),
			i.connect(o).connect(this.out),
			i.start(t);
		const a = { gain: o, src: i };
		return (
			this.beds.push(a),
			{
				set: (l, c) => {
					const h = e.currentTime;
					o.gain.cancelScheduledValues(h),
						o.gain.setValueAtTime(Math.max(o.gain.value, 1e-4), h),
						o.gain.exponentialRampToValueAtTime(
							Math.max(l, 2e-4),
							h + Math.max(c, 0.02)
						);
				},
				stop: () => {
					const l = e.currentTime;
					o.gain.cancelScheduledValues(l),
						o.gain.setTargetAtTime(1e-4, l, 0.15);
					try {
						i.stop(l + 0.8);
					} catch {}
				},
			}
		);
	}
	hush() {
		this.cut();
		for (const t of this.beds) {
			try {
				t.gain.gain.setTargetAtTime(1e-4, this.now(), 0.08),
					t.src.stop(this.now() + 0.5);
			} catch {}
		}
		this.beds = [];
	}
}
const Ne = ["cheer", "boo", "ooh", "oh", "yeah", "roar", "aww"],
	ae = "pf_ceremony_started",
	Ut = (r) => (r === "player" ? "a" : "b"),
	Ue = 0.42,
	Ye = 1.6,
	je = 4,
	Xe = 0.026;
function _e(r) {
	const t = window.requestIdleCallback;
	t ? t(r, { timeout: 1500 }) : window.setTimeout(r, 250);
}
class es {
	constructor(t) {
		w(this, "engine", null);
		w(this, "sound", new We());
		w(this, "stage");
		w(this, "overlay");
		w(this, "phone");
		w(this, "bout", null);
		w(this, "quiet", !1);
		w(this, "boardHeld", !1);
		w(this, "lightNow", 1);
		w(this, "lightTo", 1);
		w(this, "over", !1);
		w(this, "sheetPending", !1);
		w(this, "afterSettle", []);
		w(this, "boardMesh", null);
		w(this, "trophyLen", 0.14);
		w(this, "rect", { h: 0, w: 0, x: 0, y: 0 });
		w(this, "beat", !1);
		w(this, "measureIn", 0);
		w(this, "pendingStart", null);
		w(this, "warmGroup", null);
		(this.deps = t),
			window.addEventListener("resize", () => {
				this.measureIn = 0;
			}),
			(this.stage = document.createElement("div")),
			(this.stage.className = "dc-stage"),
			this.stage.setAttribute("aria-hidden", "true"),
			(this.overlay = document.createElement("div")),
			(this.overlay.className = "dc-overlay"),
			this.stage.appendChild(this.overlay),
			document.body.appendChild(this.stage),
			(this.phone = {
				camera: t.camera,
				overlay: this.overlay,
				rect: () => ({ h: this.rect.h, w: this.rect.w, x: 0, y: 0 }),
				side: "a",
			});
	}
	open(t) {
		this.flushAfterSettle(),
			(this.pendingStart = null),
			document.body.classList.add("dc-armed"),
			(this.bout = t),
			(this.quiet = !1),
			(this.boardHeld = !1),
			(this.over = !1),
			(this.sheetPending = !1),
			(this.trophyLen = Math.max(t.me.pen.length, t.them.pen.length)),
			(this.deps.scoreboard.ringed = null),
			this.wakeSound();
		const s = {
			a: {
				name: t.me.name,
				pen: t.me.pen,
				view: () => this.deps.views().player,
			},
			b: {
				name: t.them.name,
				pen: t.them.pen,
				view: () => this.deps.views().rival,
			},
		};
		this.engine
			? this.engine.setPlayers(s)
			: (this.engine = new He(this.host(), s, [this.phone])),
			(this.engine.target = t.target);
		const e = `${t.room}:${t.bout}`;
		if (t.intro === !1 || Qe() === e) {
			this.engine.sweep();
			return;
		}
		Ze(e);
		const n = be(t.sideA, we(t.deskSeed, t.bout));
		this.engine.hush(),
			(this.pendingStart = {
				calm: 0,
				opts: {
					entries: n.entries,
					lat: n.lat,
					seed: t.deskSeed + t.bout * 7919,
					tally:
						t.bout > 0 && t.tally
							? { a: t.tally.mine, b: t.tally.theirs }
							: null,
					together: t.bout > 0 && !t.watching,
				},
				since: 0,
			});
	}
	warm() {
		if (this.warmGroup) {
			return;
		}
		const t = new kt();
		(this.warmGroup = t),
			_e(() => {
				var l, c;
				this.wakeSound(!1);
				const s = new gt(new _(0.01, 0.01), oe());
				t.add(
					ze(),
					s,
					...Te(),
					...(((c = (l = this.deps).warmObjects) == null
						? void 0
						: c.call(l)) ?? [])
				);
				const e = this.deps.desk();
				t.position.set(0, -0.25, e.z), t.scale.setScalar(1e-5);
				const { renderer: n, camera: i, scene: o } = this.deps,
					a = () => {
						o.add(t),
							requestAnimationFrame(() =>
								requestAnimationFrame(() => o.remove(t))
							);
					};
				try {
					n.compileAsync(t, i, o).then(a, a);
				} catch {
					a();
				}
			});
	}
	turnBegan() {
		const t = this.engine;
		if (!t) {
			return;
		}
		(this.pendingStart = null), t.waiting && t.firstFlick();
		const s = t.acting;
		(s === "start" || s === "next" || s === "decider") && t.cutToPlay();
	}
	catchUp(t) {
		var e, n, i;
		if (((this.quiet = t), !t)) {
			return;
		}
		this.pendingStart = null;
		const s = (e = this.engine) == null ? void 0 : e.acting;
		(s === "start" || s === "next" || s === "decider") &&
			((n = this.engine) == null || n.cutToPlay()),
			(i = this.engine) == null || i.showPens(),
			this.releaseBoard();
	}
	roundResolved(t, s, e, n) {
		const i = this.engine,
			o = this.bout;
		if (!(i && o)) {
			return;
		}
		const a = Me(Ut(t), [...s].map(Ut), { a: e.player, b: e.rival });
		if (!a || (this.releaseBoard(), this.quiet)) {
			return;
		}
		const l = { ...n };
		a.winner && l[a.winner]++,
			!(a.winner && l[a.winner] >= o.target) &&
				(this.wakeSound(),
				(this.boardHeld = !!a.winner),
				i.round({ ...a, prev: n, score: l }));
	}
	get showing() {
		return this.over;
	}
	holdingBoard() {
		return this.boardHeld;
	}
	roundStarted(t) {
		if (this.engine) {
			if (this.quiet) {
				this.engine.showPens();
				return;
			}
			this.wakeSound(), this.engine.roundStart(t);
		}
	}
	ended(t) {
		const s = this.engine,
			e = this.bout;
		if (!(s && e)) {
			this.deps.presentSheet();
			return;
		}
		this.releaseBoard(),
			this.wakeSound(),
			(this.over = !0),
			(this.sheetPending = !0),
			this.leaveRoomForName();
		const n = t.winner === "a" ? e.me.pen.length : e.them.pen.length;
		(this.trophyLen = n),
			s.end({
				celebrations: ge({
					backFromTwoDown: ye(t.log, t.winner === "a" ? "p" : "b"),
					deskSeed: e.deskSeed,
					matchNo: e.bout,
					penChangedHands: t.penMoved,
				}),
				fromRound: !0,
				score: t.score,
				seed: e.deskSeed + e.bout * 31,
				winner: t.winner,
			});
	}
	sheetNow() {
		var t;
		this.sheetPending && ((t = this.engine) == null || t.skip());
	}
	leaveRoomForName() {
		const t = this.rect.w || 1,
			s = this.rect.h || 1,
			e = document.documentElement.style;
		if (t > s && s <= 560) {
			e.removeProperty("--dc-sheet-top");
			return;
		}
		const n = this.endLayout().wonTop + 0.25 * Math.min(t, s);
		e.setProperty("--dc-sheet-top", `${Math.round(this.rect.y + n)}px`);
	}
	overtaken() {
		var t;
		this.over &&
			((this.sheetPending = !1),
			(t = this.engine) == null || t.skip(),
			this.settle());
	}
	settle() {
		var t, s;
		this.sheetPending && ((t = this.engine) == null || t.skip()),
			(this.over = !1),
			(s = this.engine) == null || s.settle(),
			document.documentElement.style.removeProperty("--dc-sheet-top"),
			this.flushAfterSettle();
	}
	afterSettled(t) {
		this.over ? this.afterSettle.push(t) : t();
	}
	stop() {
		var t;
		(this.pendingStart = null),
			(t = this.engine) == null || t.dispose(),
			(this.engine = null),
			this.sound.cut(),
			(this.overlay.innerHTML = ""),
			(this.over = !1),
			(this.sheetPending = !1),
			document.documentElement.style.removeProperty("--dc-sheet-top"),
			this.releaseBoard(),
			(this.lightNow = 1),
			(this.lightTo = 1),
			this.deps.mood.dim(1),
			this.deps.audio.holdRoom(1, 0.3),
			this.deps.hold(!1),
			(this.beat = !1),
			document.body.classList.remove("dc-beat", "dc-armed"),
			this.flushAfterSettle();
	}
	frame(t) {
		const s = this.engine;
		if (!s) {
			return;
		}
		this.fitStage(),
			this.startWhenSteady(s, t),
			s.update(t),
			s.apply("a", this.phone);
		const e = s.acting === "round" || s.away;
		e !== this.beat &&
			((this.beat = e), document.body.classList.toggle("dc-beat", e)),
			this.lightNow !== this.lightTo &&
				((this.lightNow +=
					(this.lightTo - this.lightNow) * Math.min(1, t * 3.2)),
				Math.abs(this.lightNow - this.lightTo) < 0.004 &&
					(this.lightNow = this.lightTo),
				this.deps.mood.dim(this.lightNow)),
			this.over &&
				!this.sheetPending &&
				!this.deps.sheetOpen() &&
				this.settle();
	}
	startWhenSteady(t, s) {
		const e = this.pendingStart;
		if (e) {
			if (t.acting !== "start") {
				this.pendingStart = null;
				return;
			}
			this.deps.sheetOpen() ||
				((e.since += s),
				(e.calm = s > 0 && s < Xe ? e.calm + 1 : 0),
				((e.since >= Ue && e.calm >= je) || e.since >= Ye) &&
					((this.pendingStart = null), t.start(e.opts)));
		}
	}
	releaseBoard() {
		this.boardHeld && ((this.boardHeld = !1), this.deps.drawBoard());
	}
	flushAfterSettle() {
		const t = this.afterSettle;
		this.afterSettle = [];
		for (const s of t) {
			s();
		}
	}
	wakeSound(t = !0) {
		const s = this.deps.audio.ceremonyOut();
		s &&
			(this.sound.attach(s.ctx, s.dest, 0.75),
			t && this.deps.audio.gameHeard() && this.sound.prepare(Ne));
	}
	fitStage() {
		if (this.measureIn-- > 0) {
			return;
		}
		this.measureIn = 30;
		const t = this.deps.canvas.getBoundingClientRect();
		if (
			t.width === this.rect.w &&
			t.height === this.rect.h &&
			t.left === this.rect.x &&
			t.top === this.rect.y
		) {
			return;
		}
		this.rect = { h: t.height, w: t.width, x: t.left, y: t.top };
		const s = this.stage.style;
		(s.left = `${t.left}px`),
			(s.top = `${t.top}px`),
			(s.width = `${t.width}px`),
			(s.height = `${t.height}px`),
			(s.inset = "auto");
	}
	findBoard() {
		var e;
		if ((e = this.boardMesh) != null && e.parent) {
			return this.boardMesh;
		}
		const t = this.deps.scoreboard.texture;
		let s = null;
		return (
			this.deps.scene.traverse((n) => {
				const i = n;
				if (s || !i.isMesh) {
					return;
				}
				const o = i.material;
				o &&
					!Array.isArray(o) &&
					o.map === t &&
					i.geometry instanceof _ &&
					(s = i);
			}),
			(this.boardMesh = s),
			s
		);
	}
	boardPoint(t) {
		var c;
		if (this.deps.boardHidden()) {
			return null;
		}
		const s = (c = this.deps.scoreboard.scoreAt) == null ? void 0 : c[t],
			e = this.findBoard(),
			n = this.deps.scoreboard.texture.image;
		if (!(s && e && n != null && n.width && e.visible)) {
			return null;
		}
		const { width: i, height: o } = e.geometry.parameters;
		e.updateMatrixWorld();
		const a = e.localToWorld(
				new y((s.x / n.width - 0.5) * i, (0.5 - s.y / n.height) * o, 0.012)
			),
			l = a.clone().project(this.deps.camera);
		return Math.abs(l.x) > 1.02 || Math.abs(l.y) > 1.02 ? null : a;
	}
	endLayout() {
		const t = this.rect.w || 1,
			s = this.rect.h || 1;
		if (t > s && s <= 560) {
			const o = 0.32 * s;
			return {
				penX: 0.27 * t,
				penY: o,
				wonLeft: 0.27 * t,
				wonTop: o + 0.07 * s,
			};
		}
		let e = 0.08 * s;
		const n = this.deps.board();
		if (n && !this.deps.boardHidden()) {
			const o = this.deps.camera;
			o.updateMatrixWorld();
			const a = new y(0, n.bottom, n.z).project(o);
			Math.abs(a.y) <= 1 && (e = ((1 - a.y) / 2) * s);
		}
		const i = Mt.clamp(e + 0.075 * s, 0.16 * s, 0.4 * s);
		return { penX: 0.5 * t, penY: i, wonTop: i + 0.05 * s };
	}
	trophyTarget() {
		const t = this.deps.camera;
		t.updateMatrixWorld();
		const s = this.rect.w && this.rect.h ? this.rect.w / this.rect.h : t.aspect,
			e = s < 1 ? 0.52 : 0.32,
			n = 2 * Math.tan(Mt.degToRad(t.fov) / 2) * s,
			i = Mt.clamp(this.trophyLen / (e * n), 0.22, 1.4),
			o = this.endLayout(),
			a = (2 * o.penX) / (this.rect.w || 1) - 1,
			l = 1 - (2 * o.penY) / (this.rect.h || 1),
			c = new y(a, l, 0.5).unproject(t).sub(t.position).normalize();
		return t.position.clone().add(c.multiplyScalar(i));
	}
	host() {
		const t = this.deps,
			s = this;
		return {
			get board() {
				return t.board() ?? { bottom: 0.7, top: 1.6, z: -1.2 };
			},
			boardLand: () => {
				(s.boardHeld = !1), t.drawBoard();
			},
			boardPoint: (e, n) => s.boardPoint(n),
			boardRing: (e) => {
				(t.scoreboard.ringed = e === "a" ? "you" : "rival"), t.drawBoard();
			},
			buzz: (e) => {
				var n;
				if (!t.reducedMotion()) {
					try {
						(n = navigator.vibrate) == null || n.call(navigator, e);
					} catch {}
				}
			},
			get desk() {
				const e = t.desk();
				return { center: new y(0, 0, e.z), d: e.d, w: e.w };
			},
			dim: (e) => {
				s.lightTo = e;
			},
			eye: () => t.camera.position.clone(),
			hear: () => "a",
			hold: (e) => t.hold(e),
			quake: (e) => t.shake(e / 0.014),
			get reducedMotion() {
				return t.reducedMotion();
			},
			roomTone: (e, n) => t.audio.holdRoom(e, n),
			scene: t.scene,
			sheet: () => {
				s.sheetPending && ((s.sheetPending = !1), t.presentSheet());
			},
			sound: this.sound,
			stage: t.scene,
			throwChalk: (e) => t.throwChalk(e === "a" ? "player" : "rival"),
			trophyTarget: () => s.trophyTarget(),
			get watching() {
				var e;
				return !!((e = s.bout) != null && e.watching);
			},
			wonAt: () => {
				const e = s.endLayout();
				return { left: e.wonLeft, top: e.wonTop };
			},
		};
	}
}
function Qe() {
	try {
		return localStorage.getItem(ae);
	} catch {
		return null;
	}
}
function Ze(r) {
	try {
		localStorage.setItem(ae, r);
	} catch {}
}
export { es as MatchCeremony };
