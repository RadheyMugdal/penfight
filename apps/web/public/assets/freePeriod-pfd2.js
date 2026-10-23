var An = Object.defineProperty;
var Rn = (t, e, s) =>
	e in t
		? An(t, e, { configurable: !0, enumerable: !0, value: s, writable: !0 })
		: (t[e] = s);
var B = (t, e, s) => Rn(t, typeof e == "symbol" ? e : e + "", s);
import {
	bL as _e,
	b5 as _n,
	bH as _t,
	bd as $e,
	bt as $n,
	b1 as A,
	br as Be,
	bj as Bn,
	b8 as bn,
	be as Cn,
	bg as Dn,
	bl as en,
	bM as eo,
	bN as et,
	b7 as Fn,
	bb as ft,
	bu as Gn,
	b4 as Gt,
	bi as Hn,
	b3 as In,
	bJ as Jn,
	ba as Jt,
	bE as jn,
	v as Kn,
	b9 as Kt,
	b6 as Ln,
	bq as Me,
	bO as Mt,
	bs as Nn,
	bD as nn,
	bQ as no,
	bh as On,
	bo as Ot,
	bc as ot,
	bK as Qn,
	bk as Qt,
	bv as qn,
	bA as qt,
	V as re,
	bm as S,
	b2 as Tn,
	bn as te,
	bx as tn,
	bP as to,
	bw as Un,
	bp as ue,
	bF as Vn,
	bf as Wn,
	by as Xn,
	bC as xn,
	bz as Yn,
	bB as yn,
	bI as yt,
	bG as Zn,
} from "./main-pfd2.js";
import "./index-pfd2.js";
function oo(t, e = new Set()) {
	const s = new Set(),
		o = new Set(),
		c = new Set();
	t.traverse((n) => {
		if (n instanceof A || n instanceof Tn || n instanceof In) {
			s.add(n.geometry);
			for (const h of Array.isArray(n.material) ? n.material : [n.material]) {
				o.add(h);
			}
		}
		(n instanceof Gt || n instanceof _n) && n.shadow.dispose();
	});
	for (const n of o) {
		for (const h of Object.values(n)) {
			h instanceof Ln && !e.has(h) && c.add(h);
		}
		n.dispose();
	}
	for (const n of s) {
		n.dispose();
	}
	for (const n of c) {
		n.dispose();
	}
}
function on(t) {
	const e = new Map();
	for (const s of t.children) {
		if (
			!(s instanceof A) ||
			s.children.length ||
			Array.isArray(s.material) ||
			s.material.transparent ||
			!s.visible ||
			s.renderOrder !== 0
		) {
			continue;
		}
		const o = `${s.material.uuid}:${s.castShadow}:${s.receiveShadow}`,
			c = e.get(o) || [];
		c.push(s), e.set(o, c);
	}
	for (const s of e.values()) {
		if (s.length < 2) {
			continue;
		}
		const o = s.map(
				(h) => (h.updateMatrix(), h.geometry.clone().applyMatrix4(h.matrix))
			),
			c = Fn(o, !1);
		if ((o.forEach((h) => h.dispose()), !c)) {
			continue;
		}
		c.computeBoundingSphere();
		const n = new A(c, s[0].material);
		(n.castShadow = s[0].castShadow),
			(n.receiveShadow = s[0].receiveShadow),
			(n.name = "static paper fixture"),
			s.forEach((h) => {
				t.remove(h), h.geometry.dispose();
			}),
			t.add(n);
	}
}
const Et = Math.PI / 180,
	E = {
		behind: 1.7,
		bin: { fill: 0.31, rimHeight: 0.4, rimRadius: 0.16, x: 0, z: 0.26 },
		ceiling: 3.3,
		desk: { blockX: 0.85, depth: 0.42, height: 0.75, width: 1.3 },
		door: { top: 2.12, z0: 0.5, z1: 1.45 },
		fan: { height: 2.85, radius: 1.6, x: 0.9, z: 2 },
		halfWidth: 2.2,
		rows: { count: 7, firstFarEdge: 1.165, pitch: 0.75 },
		seat: { x: -0.2 },
		table: { top: 0.76, xMax: -0.25, xMin: -1.05, zMax: 1.35, zMin: 0.55 },
	},
	tt = { h: 0.32, reach: 0.32, w: 0.28, x: 0.86, y: 0.96, z: 0.035 },
	Lt = { last: 6, middle: 4, third: 2 };
function We(t) {
	return E.rows.firstFarEdge + E.rows.pitch * Lt[t];
}
We("third") - E.bin.z, We("middle") - E.bin.z, We("last") - E.bin.z;
function Ne(t) {
	return t === "right" ? 0.2 : E.seat.x;
}
function xt(t, e = "left") {
	const s = e === "right" ? 0.06 : -0.06;
	return { x: Ne(e) + s, y: E.desk.height + be.radius, z: We(t) + 0.06 };
}
function Mn(t, e = E.seat.x) {
	return Math.atan2(E.bin.x - e, We(t) - E.bin.z);
}
function so(t, e) {
	const { rows: s, desk: o } = E,
		c = Math.abs(t);
	if (c < o.blockX - o.width / 2 || c > o.blockX + o.width / 2) {
		return !1;
	}
	const n = e - s.firstFarEdge;
	return n < 0
		? !1
		: n % s.pitch <= o.depth && Math.floor(n / s.pitch) < s.count;
}
const be = { drag: 55e-5, mass: 0.004, radius: 0.025 },
	Ge = {
		elevation: { last: 28 * Et, middle: 32 * Et, third: 38 * Et },
		height: 1.05,
		maxLateral: 25 * Et,
		speed: {
			last: { max: 12.8, min: 6.8 },
			middle: { max: 10, min: 4.6 },
			third: { max: 6.9, min: 2.9 },
		},
	};
function ao(t, e, s) {
	return { elevation: Ge.elevation[t], lateral: e, speed: lo(s, t) };
}
const Ut = { gust: 0.08, gustPerSetting: 0.05, out: 3.2 },
	io = [0, 0.16, 0.34, 0.55, 0.77, 1];
function Yt(t) {
	if (t.setting === 0) {
		return 0;
	}
	const e = Ut.gust + Ut.gustPerSetting * t.setting;
	return io[t.setting] * (1 + e * t.jitter);
}
function vn(t, e, s) {
	if (
		((s.x = 0), (s.y = 0), (s.z = 0), e.setting === 0 || t.y > E.fan.height)
	) {
		return s;
	}
	const o = e.side === "left" ? -0.9 : E.fan.x,
		c = t.x - o,
		n = t.z - E.fan.z,
		h = Math.hypot(c, n),
		i = E.fan.radius;
	if (h >= i) {
		return s;
	}
	const a = h / i,
		p = Yt(e),
		M = Ut.out * p * 4 * a * (1 - a),
		P = h > 1e-6 ? 1 / h : 0;
	return (
		(s.x = M * c * P), (s.z = M * n * P), (s.y = -2.6 * p * (1 - a * a)), s
	);
}
const nt = 18;
function sn(t) {
	return Math.max(360, Math.min(640, t * 0.7));
}
const ro = 0.5;
function lo(t, e) {
	const s = Math.min(1, Math.max(0, t)),
		{ min: o, max: c } = Ge.speed[e],
		n = s * 2 - 1;
	return (o + c) / 2 + ((c - o) / 2) * ((n * n * n + n) / 2);
}
function an(t, e, s = "left") {
	const o = Math.hypot(t.dx, t.dy);
	if (o < nt || -t.dy < o * 0.5) {
		return null;
	}
	const c = Math.max(
			-Ge.maxLateral,
			Math.min(Ge.maxLateral, Math.atan2(t.dx, -t.dy) * ro)
		),
		n = (o - nt) / Math.max(1, t.budget - nt);
	return ao(e, Mn(e, Ne(s)) + c, n);
}
const Le = 1 / 240,
	co = 4,
	ho = 4,
	fo = -9.81,
	Ht = 0.4,
	Bt = 0.85,
	Pt = 0.4,
	At = 0.15,
	rn = 0.6,
	ln = 0.35,
	Rt = 0.7,
	uo = 0.3,
	cn = 0.75,
	po = 2.4,
	dn = E.bin.fill,
	hn = 0.3,
	Tt = { x: 0, y: 0, z: 0 },
	fn = 0.35;
function mo(t, e, s, o = E.seat.x, c = !1) {
	const n = { x: o, y: Ge.height, z: We(t) },
		h = Math.cos(s.elevation),
		i = Math.sin(s.elevation),
		a = {
			x: s.speed * h * Math.sin(s.lateral),
			y: s.speed * i,
			z: -s.speed * h * Math.cos(s.lateral),
		},
		{ bin: p, table: M } = E,
		P = p.rimHeight,
		z = p.rimRadius,
		f = be.radius,
		d = [],
		u = [{ ...n }];
	let T = null,
		W = null,
		ne = !1,
		F = -1;
	const U = { x: 0, y: 0, z: 0 };
	let J = "flight",
		G = 0,
		le = 0,
		ye = n.y,
		Ae = n.z;
	const we = () => {
			F >= 0 || ((F = G), (U.x = n.x), (U.y = n.y), (U.z = n.z));
		},
		O = () => {
			le % co === 0 && u.push({ ...n });
		};
	while (G < ho) {
		if (J === "rolling") {
			const Z = Math.hypot(a.x, a.z);
			if (Z < 0.12) {
				break;
			}
			const V = Math.min(Z, po * Le);
			(a.x -= (a.x / Z) * V),
				(a.z -= (a.z / Z) * V),
				(n.x += a.x * Le),
				(n.z += a.z * Le),
				(G += Le),
				le++;
			const ae = n.x - p.x,
				C = n.z - p.z,
				de = Math.hypot(ae, C);
			if (de < z + f) {
				const ke = ae / de,
					Se = C / de,
					L = a.x * ke + a.z * Se;
				L < 0 && ((a.x -= (1 + Pt) * L * ke), (a.z -= (1 + Pt) * L * Se)),
					(n.x = p.x + ke * (z + f)),
					(n.z = p.z + Se * (z + f));
			}
			n.z - f <= 0 && a.z < 0 && ((n.z = f), (a.z = -a.z * At)),
				Math.abs(n.x) + f >= E.halfWidth &&
					Math.sign(a.x) === Math.sign(n.x) &&
					((n.x = Math.sign(n.x) * (E.halfWidth - f)), (a.x = -a.x * At)),
				O();
			continue;
		}
		vn(n, e, Tt);
		const ce = a.x - Tt.x,
			Y = a.y - Tt.y,
			ve = a.z - Tt.z,
			Q = Math.hypot(ce, Y, ve),
			X = (be.drag * Q) / be.mass;
		(a.x -= X * ce * Le),
			(a.y += (fo - X * Y) * Le),
			(a.z -= X * ve * Le),
			(ye = n.y),
			(Ae = n.z),
			(n.x += a.x * Le),
			(n.y += a.y * Le),
			(n.z += a.z * Le),
			(G += Le),
			le++;
		const j = n.x - p.x,
			oe = n.z - p.z,
			se = Math.hypot(j, oe);
		if (J === "inBin") {
			if (se + f > z) {
				const Z = 1 / se,
					V = j * Z,
					ae = oe * Z,
					C = a.x * V + a.z * ae;
				C > 0 && ((a.x -= (1 + hn) * C * V), (a.z -= (1 + hn) * C * ae)),
					(n.x = p.x + V * (z - f)),
					(n.z = p.z + ae * (z - f));
			}
			if (n.y - f <= dn) {
				if (((n.y = dn + f), a.y < -0.3)) {
					(a.y = -a.y * 0.25), (a.x *= 0.6), (a.z *= 0.6);
				} else if (
					((a.y = 0), (a.x *= 0.5), (a.z *= 0.5), Math.hypot(a.x, a.z) < 0.08)
				) {
					O();
					break;
				}
			}
			O();
			continue;
		}
		if (
			(T === null && ye >= P && n.y < P && (T = { dx: j, dz: oe }),
			W === null && Ae > p.z && n.z <= p.z && (W = { dx: j, y: n.y }),
			c)
		) {
			if ((O(), n.y - f <= 0)) {
				break;
			}
			continue;
		}
		{
			const Z = Math.hypot(se - z, n.y - P);
			if (Z < f) {
				const V = se > 1e-6 ? 1 / se : 0,
					ae = (se - z) * j * V,
					C = n.y - P,
					de = (se - z) * oe * V,
					ke = Z || 1,
					Se = ae / ke,
					L = C / ke,
					xe = de / ke,
					ze = a.x * Se + a.y * L + a.z * xe;
				ze < 0 &&
					((a.x = (a.x - (1 + Ht) * ze * Se) * Bt),
					(a.y = (a.y - (1 + Ht) * ze * L) * Bt),
					(a.z = (a.z - (1 + Ht) * ze * xe) * Bt),
					(n.x += Se * (f - Z)),
					(n.y += L * (f - Z)),
					(n.z += xe * (f - Z)),
					d[d.length - 1] !== "rim" && d.push("rim"));
			}
		}
		if (n.y < P) {
			if (se < z) {
				(ne = !0), we(), (J = "inBin"), O();
				continue;
			}
			if (se < z + f) {
				const Z = 1 / se,
					V = j * Z,
					ae = oe * Z,
					C = a.x * V + a.z * ae;
				C < 0 &&
					((a.x -= (1 + Pt) * C * V),
					(a.z -= (1 + Pt) * C * ae),
					(n.x = p.x + V * (z + f)),
					(n.z = p.z + ae * (z + f)),
					d.push("bin"));
			}
		}
		if (
			n.x > M.xMin &&
			n.x < M.xMax &&
			n.z > M.zMin &&
			n.z < M.zMax &&
			ye - f >= M.top &&
			n.y - f < M.top &&
			a.y < 0 &&
			(we(),
			(n.y = M.top + f),
			(a.y = -a.y * ln),
			(a.x *= Rt),
			(a.z *= Rt),
			d.push("table"),
			a.y < fn)
		) {
			O();
			break;
		}
		if (
			ye - f >= E.desk.height &&
			n.y - f < E.desk.height &&
			a.y < 0 &&
			so(n.x, n.z) &&
			(we(),
			(n.y = E.desk.height + f),
			(a.y = -a.y * ln),
			(a.x *= Rt),
			(a.z *= Rt),
			d.push("desk"),
			a.y < fn)
		) {
			O();
			break;
		}
		if (Math.abs(n.x) + f >= E.halfWidth && Math.sign(a.x) === Math.sign(n.x)) {
			if (
				(n.x > 0 &&
					n.z > E.door.z0 &&
					n.z < E.door.z1 &&
					n.y + f < E.door.top &&
					!d.includes("door") &&
					(we(), d.push("door")),
				!d.includes("door"))
			) {
				(n.x = Math.sign(n.x) * (E.halfWidth - f)),
					(a.x = -a.x * At),
					d.push("side");
			} else if (n.x > E.halfWidth + 0.9) {
				O();
				break;
			}
		}
		n.z - f <= 0 &&
			a.z < 0 &&
			((n.z = f), (a.z = -a.z * At), (a.x *= rn), (a.y *= rn), d.push("wall")),
			n.y + f >= E.ceiling &&
				a.y > 0 &&
				((n.y = E.ceiling - f), (a.y = -a.y * 0.3), d.push("ceiling")),
			n.y - f <= 0 &&
				(we(),
				(n.y = f),
				a.y < -0.6
					? ((a.y = -a.y * uo), (a.x *= cn), (a.z *= cn))
					: ((a.y = 0), (J = "rolling"))),
			O();
	}
	return (
		u.push({ ...n }),
		{
			atBin: W,
			atRim: T,
			contacts: d,
			flight: F >= 0 ? F : G,
			made: ne,
			outcome: go(ne, d, F >= 0 ? U : n, W),
			path: u,
			settle: G,
		}
	);
}
function go(t, e, s, o) {
	return t
		? e.some((c) => c === "wall" || c === "table")
			? "banked"
			: "in"
		: e.includes("door")
			? "out"
			: e.includes("rim")
				? "rim"
				: o && Math.abs(o.dx) > E.bin.rimRadius
					? "wide"
					: e.includes("wall")
						? "over"
						: e.includes("table")
							? "wide"
							: e.includes("bin") || s.z > E.bin.z + E.bin.rimRadius
								? "short"
								: "wide";
}
function wo() {
	const e = $e(941),
		s = new Float32Array(216),
		o = new Float32Array(288),
		c = [];
	for (let d = 0; d < 12; d++) {
		const u = d * 6;
		c.push(
			u,
			u + 1,
			u + 2,
			u + 1,
			u + 3,
			u + 2,
			u + 2,
			u + 3,
			u + 4,
			u + 3,
			u + 5,
			u + 4
		);
	}
	const n = new bn(),
		h = new Kt(s, 3).setUsage(Jt),
		i = new Kt(o, 4).setUsage(Jt);
	n.setAttribute("position", h), n.setAttribute("color", i), n.setIndex(c);
	const a = new ft({
		color: 15_656_654,
		depthWrite: !1,
		side: ot,
		toneMapped: !1,
		transparent: !0,
		vertexColors: !0,
	});
	a.forceSinglePass = !0;
	const p = new A(n, a);
	(p.name = "paper-airflow"), (p.frustumCulled = !1), (p.visible = !1);
	const M = Array.from({ length: 12 }, () => ({
			age: 0,
			life: 0,
			x: 0,
			y: 0,
			z: 0,
		})),
		P = (d, u = !1) => {
			(d.x = (e() - 0.5) * 0.8),
				(d.y = 0.68 + e() * 0.32),
				(d.z = 1.4 + e() * 0.7),
				(d.life = 1.6 + e() * 1.2),
				(d.age = u ? e() * d.life : 0);
		};
	M.forEach((d) => P(d, !0));
	let z = { jitter: 0, setting: 0, side: "left" };
	const f = { x: 0, y: 0, z: 0 };
	return {
		mesh: p,
		setFan(d) {
			(d.side !== z.side || d.setting !== z.setting) &&
				M.forEach((u) => P(u, !0)),
				(z = { ...d }),
				(p.visible = d.setting > 0);
		},
		tick(d, u = !0) {
			if (((p.visible = u && z.setting > 0), !p.visible)) {
				return;
			}
			const T = Yt(z),
				W = Math.min(d, 0.05);
			for (let ne = 0; ne < 12; ne++) {
				const F = M[ne];
				(F.age += W * (0.6 + T * 0.8)),
					(F.age > F.life || F.y < 0.42 || Math.abs(F.x) > 0.85) && P(F),
					vn(F, z, f),
					(F.x += f.x * W * 0.45),
					(F.y += f.y * W * 0.45),
					(F.z += f.z * W * 0.45);
				const U = Math.hypot(f.x, f.y),
					J = U ? -f.y / U : 0,
					G = U ? f.x / U : 0,
					le = 0.0015 + T * 0.002,
					ye = 0.07 + T * 0.06,
					Ae =
						Math.min(1, F.age / 0.3, (F.life - F.age) / 0.3) *
						(0.12 + T * 0.14);
				for (let we = 0; we < 6; we++) {
					const O = Math.floor(we / 2),
						ce = we % 2 ? 1 : -1,
						Y = ((2 - O) / 2) * ye,
						ve = (ne * 6 + we) * 3,
						Q = (ne * 6 + we) * 4;
					(s[ve] = F.x - f.x * Y + J * le * ce),
						(s[ve + 1] = F.y - f.y * Y + G * le * ce),
						(s[ve + 2] = F.z - f.z * Y),
						(o[Q] = o[Q + 1] = o[Q + 2] = 1),
						(o[Q + 3] = O === 1 ? Math.max(0, Ae) : 0);
				}
			}
			h.needsUpdate = i.needsUpdate = !0;
		},
	};
}
let Xt = null;
const kn = new Cn()
		.loadAsync("/assets/schoolbag.glb")
		.then((t) => ((Xt = t), t))
		.catch(() => null),
	Yo = () => kn,
	ht = new S({ color: 2_828_323, metalness: 0.3, roughness: 0.7 }),
	bo = new S({ color: 11_040_319, roughness: 0.8 }),
	Ie = new S({ color: 5_521_452, roughness: 0.85 }),
	un = new S({ color: 9_068_592, roughness: 0.9 }),
	wt = new S({ color: 15_129_798, roughness: 0.96 }),
	pn = new S({ color: 8_689_023, roughness: 0.96 }),
	mn = new S({ color: 8_014_396, roughness: 0.9 }),
	yo = new S({ color: 15_789_021, roughness: 0.9 });
new S({ color: 12_104_872, metalness: 0.7, roughness: 0.38 });
const gn = new S({ color: 5_003_863, metalness: 0.38, roughness: 0.7 }),
	xo = new S({ color: 15_854_034, flatShading: !0, roughness: 1 }),
	Ft = new ft({ colorWrite: !1, depthWrite: !1 }),
	ut = (t, e, s) => {
		const o = document.createElement("canvas");
		(o.width = t), (o.height = e), s(o.getContext("2d"));
		const c = new yn(o);
		return (c.colorSpace = xn), (c.anisotropy = 8), c;
	},
	D = (t, e, s, o, c, n, h, i = !0) => {
		const a = new A(new Me(t, e, s), o);
		return (
			a.position.set(c, n, h), (a.castShadow = i), (a.receiveShadow = !0), a
		);
	};
function Mo() {
	return ut(1024, 512, (t) => {
		const e = $e(2024),
			s = 1024,
			o = 512,
			c = t.createLinearGradient(0, 0, s, 0);
		c.addColorStop(0, "#3b6448"),
			c.addColorStop(0.5, "#456f50"),
			c.addColorStop(1, "#385f44"),
			(t.fillStyle = c),
			t.fillRect(0, 0, s, o);
		for (let i = 0; i < 900; i++) {
			(t.fillStyle =
				e() < 0.5
					? `rgba(30, 50, 36, ${0.04 + e() * 0.08})`
					: `rgba(110, 140, 112, ${0.03 + e() * 0.06})`),
				t.fillRect(e() * s, e() * o, 2 + e() * 10, 1 + e() * 5);
		}
		for (const [i, a, p] of [
			[0, 48, 1],
			[o - 70, o, -1],
		]) {
			const M = t.createLinearGradient(0, i, 0, a);
			M.addColorStop(p > 0 ? 0 : 1, "rgba(120, 78, 44, 0.85)"),
				M.addColorStop(p > 0 ? 0.55 : 0.45, "rgba(120, 78, 44, 0.3)"),
				M.addColorStop(p > 0 ? 1 : 0, "rgba(120, 78, 44, 0)"),
				(t.fillStyle = M),
				t.fillRect(0, i, s, a - i);
		}
		for (let i = 0; i < 40; i++) {
			const a = e() * s,
				M = e() < 0.5 ? 10 + e() * 40 : o - 30 - e() * 60;
			(t.fillStyle =
				e() < 0.6
					? `rgba(150, 96, 50, ${0.5 + e() * 0.4})`
					: `rgba(170, 165, 150, ${0.5 + e() * 0.4})`),
				t.beginPath(),
				t.ellipse(a, M, 6 + e() * 18, 3 + e() * 9, e(), 0, Math.PI * 2),
				t.fill();
		}
		const n = s * 0.31,
			h = t.createLinearGradient(0, 40, 0, 240);
		h.addColorStop(0, "rgba(140, 86, 40, 0.55)"),
			h.addColorStop(1, "rgba(140, 86, 40, 0)"),
			(t.fillStyle = h),
			t.fillRect(n - 5, 40, 10, 200),
			t.save(),
			t.translate(s * 0.5, o * 0.5),
			t.rotate(-0.02),
			(t.textAlign = "center"),
			(t.textBaseline = "middle"),
			(t.font = '700 150px Anton, "Arial Narrow", Impact, sans-serif'),
			(t.fillStyle = "rgba(240, 236, 224, 0.86)"),
			t.fillText("USE ME", 0, 6),
			(t.fillStyle = "#3f6a4c");
		for (const i of [-136, -40, 60, 148]) {
			t.fillRect(i, -22, 9, 60);
		}
		for (let i = 0; i < 260; i++) {
			(t.fillStyle = `rgba(63, 106, 76, ${0.15 + e() * 0.35})`),
				t.fillRect(-250 + e() * 500, -70 + e() * 140, 1 + e() * 4, 1 + e() * 4);
		}
		t.restore();
	});
}
function vo() {
	const t = new ue(),
		{ rimRadius: e, rimHeight: s } = E.bin,
		o = new Be(e, e - 0.02, s, 40, 6, !0);
	{
		const M = o.attributes.position,
			P = new re();
		for (let z = 0; z < M.count; z++) {
			P.fromBufferAttribute(M, z);
			const f = Math.atan2(P.z, P.x);
			for (const [d, u, T, W] of [
				[2.3, -0.13, 0.014, 0.55],
				[-0.9, 0.05, 0.008, 0.4],
			]) {
				const ne = Math.atan2(Math.sin(f - d), Math.cos(f - d)),
					F = Math.exp(-((ne / W) ** 2) - ((P.y - u) / 0.11) ** 2),
					U = Math.hypot(P.x, P.z),
					J = T * F;
				(P.x -= (P.x / U) * J), (P.z -= (P.z / U) * J);
			}
			M.setXYZ(z, P.x, P.y, P.z);
		}
		o.computeVertexNormals();
	}
	const c = new A(
		o,
		new S({ map: Mo(), metalness: 0.35, roughness: 0.62, side: ot })
	);
	(c.position.y = s / 2),
		(c.castShadow = !0),
		(c.receiveShadow = !0),
		(c.rotation.y = Math.PI),
		t.add(c);
	const n = new A(
		new nn(e, 0.007, 10, 48),
		new S({ color: 9_341_566, metalness: 0.7, roughness: 0.45 })
	);
	(n.rotation.x = Math.PI / 2),
		(n.position.y = s),
		(n.castShadow = !0),
		t.add(n);
	const h = new A(
		new qt(e - 0.022, 32),
		new S({ color: 2_764_584, roughness: 1 })
	);
	(h.rotation.x = -Math.PI / 2), (h.position.y = 0.02), t.add(h);
	const i = new A(
		new nn(e - 0.02, 0.006, 8, 40),
		new S({ color: 7_234_133, metalness: 0.5, roughness: 0.6 })
	);
	(i.rotation.x = Math.PI / 2), (i.position.y = 0.006), t.add(i);
	const a = new ue(),
		p = $e(404);
	for (let M = 0; M < 40; M++) {
		const P = 0.04 + p() * E.bin.fill,
			z = (e - 0.045) * Math.sqrt(p()),
			f = p() * Math.PI * 2,
			d = E.bin.fill * (0.55 + 0.45 * (1 - (z / (e - 0.045)) ** 2)),
			u = Math.min(P, d);
		if (p() < 0.45) {
			const T = new A(
				new te(0.05 + p() * 0.07, 0.05 + p() * 0.07),
				new S({
					color: p() < 0.3 ? 14_208_432 : 15_722_450,
					roughness: 1,
					side: ot,
				})
			);
			T.rotation.set(
				-Math.PI / 2 + (p() - 0.5) * 1.1,
				p() * 3,
				(p() - 0.5) * 1.2
			),
				T.position.set(Math.cos(f) * z, u, Math.sin(f) * z),
				a.add(T);
		} else {
			const T = bt(0.7 + p() * 0.5);
			T.position.set(Math.cos(f) * z, u, Math.sin(f) * z),
				T.rotation.set(p() * 6, p() * 6, p() * 6),
				a.add(T);
		}
	}
	return t.add(a), (t.rotation.z = 0.025), (t.rotation.x = -0.012), t;
}
function bt(t = 1) {
	const e = new Zn(be.radius * t, 1),
		s = e.attributes.position,
		o = $e(Math.round(t * 1e3) + 17),
		c = new re(),
		n = new Map();
	for (let i = 0; i < s.count; i++) {
		c.fromBufferAttribute(s, i);
		const a = `${c.x.toFixed(4)},${c.y.toFixed(4)},${c.z.toFixed(4)}`;
		let p = n.get(a);
		p === void 0 &&
			((p = o() < 0.22 ? 0.62 + o() * 0.16 : 0.86 + o() * 0.34), n.set(a, p)),
			c.multiplyScalar(p),
			s.setXYZ(i, c.x, c.y, c.z);
	}
	e.computeVertexNormals();
	const h = new A(e, xo);
	return (h.castShadow = !0), h;
}
function Nt(t, e) {
	const s = new ue();
	s.position.set(t, E.ceiling, e);
	const o = new S({
			color: 15_129_796,
			emissive: 13_616_814,
			emissiveIntensity: 0.18,
			metalness: 0.15,
			roughness: 0.55,
		}),
		c = new A(new Be(0.07, 0.05, 0.06, 20), o);
	(c.position.y = -0.03), s.add(c);
	const n = E.ceiling - E.fan.height,
		h = new A(new Be(0.011, 0.011, n, 10), o);
	(h.position.y = -n / 2), s.add(h);
	const i = new ue();
	i.position.y = -n;
	const a = new A(new Be(0.085, 0.095, 0.13, 24), o);
	(a.castShadow = !0), i.add(a);
	const p = new A(new Be(0.095, 0.11, 0.03, 24), o);
	(p.position.y = -0.08), i.add(p);
	const M = ut(256, 64, (f) => {
			(f.fillStyle = "#e4dac2"), f.fillRect(0, 0, 256, 64);
			const d = f.createLinearGradient(0, 0, 0, 22);
			d.addColorStop(0, "rgba(70, 62, 50, 0.8)"),
				d.addColorStop(1, "rgba(70, 62, 50, 0)"),
				(f.fillStyle = d),
				f.fillRect(0, 0, 256, 22),
				(f.fillStyle = "rgba(120, 110, 90, 0.18)");
			for (let u = 0; u < 60; u++) {
				f.fillRect(Math.random() * 256, Math.random() * 64, 2, 1);
			}
		}),
		P = new S({
			emissive: 13_616_814,
			emissiveIntensity: 0.16,
			map: M,
			metalness: 0.1,
			roughness: 0.6,
			side: ot,
		});
	for (let f = 0; f < 3; f++) {
		const d = new ue();
		d.rotation.y = (f / 3) * Math.PI * 2;
		const u = new A(new Me(0.56, 0.004, 0.115), P);
		u.position.set(0.09 + 0.28, -0.045, 0),
			(u.rotation.x = 0.2),
			(u.castShadow = !0),
			d.add(u);
		const T = new A(new Me(0.1, 0.012, 0.05), o);
		T.position.set(0.1, -0.045, 0), d.add(T), i.add(d);
	}
	const z = new A(
		new jn(0.12, 0.66, 48),
		new ft({
			color: 8_222_056,
			depthWrite: !1,
			opacity: 0,
			side: ot,
			transparent: !0,
		})
	);
	return (
		(z.rotation.x = -Math.PI / 2),
		(z.position.y = -n - 0.045),
		s.add(z),
		s.add(i),
		{ blur: z, group: s, omega: 0, spinner: i, target: 0 }
	);
}
function ko() {
	const t = new ue(),
		e = tt.w,
		s = tt.h,
		o = ut(320, 380, (d) => {
			const u = $e(88);
			(d.fillStyle = "#3d2c22"), d.fillRect(0, 0, 320, 380);
			for (let T = 0; T < 420; T++) {
				(d.fillStyle = `rgba(${90 + u() * 40}, ${60 + u() * 30}, ${40 + u() * 20}, ${0.08 + u() * 0.12})`),
					d.fillRect(u() * 320, u() * 380, 2 + u() * 7, 1 + u() * 3);
			}
			d.fillStyle = "#9a9384";
			for (const [T, W] of [
				[16, 16],
				[304, 16],
				[16, 364],
				[304, 364],
			]) {
				d.beginPath(),
					d.arc(T, W, 6, 0, Math.PI * 2),
					d.fill(),
					(d.strokeStyle = "#5a5449"),
					(d.lineWidth = 1.6),
					d.beginPath(),
					d.moveTo(T - 4, W),
					d.lineTo(T + 4, W),
					d.stroke();
			}
			d.save(),
				d.translate(160, 150),
				d.rotate(-0.025),
				(d.fillStyle = "#e9e2d0"),
				d.fillRect(-108, -14, 216, 27),
				(d.font = '19px "Patrick Hand", cursive'),
				(d.textAlign = "center"),
				(d.fillStyle = "#5b6a92"),
				d.fillText("FAN", -54, 7),
				(d.fillStyle = "#2d3a6b"),
				d.fillText("FAN", 54, 7),
				d.restore(),
				(d.strokeStyle = "#d8d0bc"),
				(d.fillStyle = "#d8d0bc"),
				(d.lineWidth = 3.4),
				(d.font = '700 18px "Patrick Hand", cursive'),
				(d.textAlign = "center");
			for (let T = 0; T <= 5; T++) {
				const W = Math.PI * (0.75 + (T / 5) * 1.5);
				d.beginPath(),
					d.moveTo(160 + Math.cos(W) * 54, 262 + Math.sin(W) * 54),
					d.lineTo(160 + Math.cos(W) * 66, 262 + Math.sin(W) * 66),
					d.stroke(),
					d.fillText(
						String(T),
						160 + Math.cos(W) * 84,
						262 + Math.sin(W) * 84 + 6
					);
			}
		}),
		c = new A(new Me(e, s, 0.024), [
			Ie,
			Ie,
			Ie,
			Ie,
			new S({ map: o, roughness: 0.5 }),
			Ie,
		]);
	(c.castShadow = !0), t.add(c);
	const n = new S({ color: 15_262_159, roughness: 0.5 }),
		h = new S({ color: 13_814_196, roughness: 0.45 }),
		i = [];
	for (const [d, u] of ["left", "right"].entries()) {
		const T = d === 0 ? -0.062 : 0.062,
			W = new A(new Me(0.042, 0.062, 0.014), n);
		W.position.set(T, 0.078, 0.019), t.add(W);
		const ne = new ue();
		ne.position.set(T, 0.078, 0.026);
		const F = new A(new Me(0.028, 0.05, 0.009), h);
		ne.add(F), t.add(ne);
		const U = new A(new te(0.075, 0.085), Ft);
		U.position.set(T, 0.078, 0.05),
			(U.renderOrder = -1),
			t.add(U),
			i.push({ hit: U, mesh: ne, side: u });
	}
	const a = new ue(),
		p = new A(
			new Be(0.034, 0.038, 0.026, 26),
			new S({ color: 1_906_452, roughness: 0.42 })
		);
	(p.rotation.x = Math.PI / 2), (p.castShadow = !0), a.add(p);
	const M = new A(new Me(0.006, 0.03, 0.005), n);
	M.position.set(0, 0.019, 0.014), a.add(M);
	for (let d = 0; d < 20; d++) {
		const u = (d / 20) * Math.PI * 2,
			T = new A(
				new Me(0.004, 0.006, 0.024),
				new S({ color: 1_183_244, roughness: 0.5 })
			);
		T.position.set(Math.cos(u) * 0.036, Math.sin(u) * 0.036, 0),
			(T.rotation.z = u),
			a.add(T);
	}
	a.position.set(0, -0.058, 0.021), t.add(a);
	const P = new A(new te(0.14, 0.14), Ft);
	P.position.set(0, -0.058, 0.05), (P.renderOrder = -1), t.add(P);
	const z = new A(new te(e + tt.reach, s + tt.reach), Ft);
	z.position.set(0, 0, 0.05), (z.renderOrder = -1), t.add(z);
	const f = (d, u) => {
		for (const T of i) {
			T.mesh.rotation.x = T.side === d ? 0.34 : -0.34;
		}
		a.rotation.z = Math.PI * 0.75 - ((d ? u : 0) / 5) * Math.PI * 1.5;
	};
	return (
		f(null, 0),
		{
			centre: new re(),
			facing: new re(0, 0, 1),
			group: t,
			knob: { group: a, hit: P },
			paint: f,
			rockers: i,
			target: z,
		}
	);
}
function So(t, e = {}) {
	let s = !1;
	const o = new Wn(),
		{ rows: c, desk: n, bin: h, table: i, halfWidth: a, ceiling: p } = E,
		M = c.firstFarEdge + c.pitch * (c.count - 1) + n.depth + E.behind,
		P = a * 2,
		z = new Dn(11_050_377);
	(o.background = z), (o.fog = new On(z, 9, 18));
	const f = new Hn(16_774_884, 10_128_500, 1.45);
	o.add(f);
	const d = new Gt(16_773_334, 0.55);
	d.position.set(-4, 2.2, M * 0.5),
		d.target.position.set(1.5, 0.8, M * 0.5),
		o.add(d.target),
		o.add(d);
	const u = new Gt(16_772_552, 1.7);
	u.position.set(-3.6, 4.2, M * 0.5 + 1.4),
		u.target.position.set(0.4, 0, M * 0.5 - 0.6),
		o.add(u.target),
		(u.castShadow = !0),
		u.shadow.mapSize.set(2048, 2048),
		(u.shadow.camera.left = -4.5),
		(u.shadow.camera.right = 4.5),
		(u.shadow.camera.top = 5),
		(u.shadow.camera.bottom = -5),
		(u.shadow.camera.near = 0.2),
		(u.shadow.camera.far = 16),
		(u.shadow.bias = -4e-4),
		(u.shadow.normalBias = 0.015),
		o.add(u);
	const T = new Bn(16_773_852, 0.6, 5, 2);
	T.position.set(3.2, 2.4, 1.2), o.add(T);
	const W = Qt();
	(W.wrapS = W.wrapT = en), W.repeat.set(P / 0.9, M / 0.9);
	const ne = new S({ map: W, roughness: 0.95 }),
		F = new A(new te(P, M), ne);
	(F.rotation.x = -Math.PI / 2),
		F.position.set(0, 0, M / 2),
		(F.receiveShadow = !0),
		o.add(F);
	const U = Qt();
	(U.wrapS = U.wrapT = en), U.repeat.set(2, M / 0.9);
	const J = new A(new te(1.8, M), new S({ map: U, roughness: 0.95 }));
	(J.rotation.x = -Math.PI / 2),
		J.position.set(a + 0.9, 0, M / 2),
		(J.receiveShadow = !0),
		o.add(J);
	const G = ut(512, 512, (l) => {
			(l.fillStyle = "#ebe5d6"), l.fillRect(0, 0, 512, 512);
			const g = l.createRadialGradient(120, 300, 10, 120, 300, 150);
			g.addColorStop(0, "rgba(150, 128, 92, 0.28)"),
				g.addColorStop(0.7, "rgba(150, 128, 92, 0.12)"),
				g.addColorStop(0.9, "rgba(120, 98, 66, 0.2)"),
				g.addColorStop(1, "rgba(150, 128, 92, 0)"),
				(l.fillStyle = g),
				l.fillRect(0, 0, 512, 512);
		}),
		le = new A(
			new te(P, M),
			new S({
				emissive: 14_275_266,
				emissiveIntensity: 0.32,
				map: G,
				roughness: 1,
			})
		);
	(le.rotation.x = Math.PI / 2), le.position.set(0, p, M / 2), o.add(le);
	const ye = new S({ map: Ot(!1), roughness: 0.95 }),
		Ae = new A(new te(P, 2.5), ye);
	Ae.position.set(0, 1.25, 0), (Ae.receiveShadow = !0), o.add(Ae);
	const we = new A(new te(P, p - 2.5), wt);
	we.position.set(0, 2.5 + (p - 2.5) / 2, 0), o.add(we);
	{
		const m = new ue(),
			v = new A(new te(2.35, 0.98), new S({ map: t, roughness: 0.92 }));
		m.add(v);
		const x = 0.05,
			k = (q, $, ee, fe) => {
				const ge = new A(new Me(q, $, 0.035), Ie);
				ge.position.set(ee, fe, 0.002), (ge.castShadow = !0), m.add(ge);
			};
		k(2.35 + x * 2, x, 0, 0.98 / 2 + x / 2),
			k(2.35 + x * 2, x, 0, -0.98 / 2 - x / 2),
			k(x, 0.98, -2.35 / 2 - x / 2, 0),
			k(x, 0.98, 2.35 / 2 + x / 2, 0);
		const b = new A(new Me(2.35 * 0.85, 0.02, 0.07), Ie);
		b.position.set(0, -0.98 / 2 - x - 0.005, 0.045),
			(b.castShadow = !0),
			m.add(b);
		for (const [q, $] of [
			[-0.28, 0.35],
			[-0.13, -0.9],
			[0.31, 0.2],
		]) {
			const ee = new A(new Be(0.005, 0.005, 0.06, 8), yo);
			(ee.rotation.z = Math.PI / 2),
				(ee.rotation.y = $),
				ee.position.set(q, -0.98 / 2 - x + 0.012, 0.05),
				m.add(ee);
		}
		const y = new A(
			new Me(0.13, 0.028, 0.055),
			new S({ color: 5_259_834, roughness: 0.8 })
		);
		y.position.set(0.52, -0.98 / 2 - x + 0.022, 0.045),
			(y.castShadow = !0),
			m.add(y),
			m.position.set(0, 1.76, 0.03),
			o.add(m);
		const R = new A(new te(0.5, 0.69), new S({ map: Nn(), roughness: 0.95 }));
		R.position.set(-1.72, 1.72, 0.012), (R.rotation.z = 0.012), o.add(R);
		const N = new A(new te(0.3, 0.4), new S({ map: $n(), roughness: 0.95 }));
		N.position.set(1.62, 1.92, 0.012), (N.rotation.z = -0.03), o.add(N);
		const H = new A(
			new te(0.62, 0.175),
			new S({ map: Gn("FREE PERIOD"), roughness: 0.78 })
		);
		H.position.set(1.62, 2.62, 0.012), (H.rotation.z = -0.012), o.add(H);
	}
	{
		const l = i.xMax - i.xMin,
			g = i.zMax - i.zMin,
			m = (i.xMin + i.xMax) / 2,
			v = (i.zMin + i.zMax) / 2,
			x = new S({ color: 5_913_122, roughness: 0.5 }),
			k = new S({ color: 3_103_300, roughness: 0.7 }),
			b = D(l, 0.035, g, x, m, i.top - 0.0175, v);
		o.add(b);
		const y = new A(new te(l - 0.14, g - 0.14), k);
		(y.rotation.x = -Math.PI / 2),
			y.position.set(m, i.top + 0.001, v),
			(y.receiveShadow = !0),
			o.add(y);
		const R = D(l - 0.06, 0.12, 0.02, x, m, i.top - 0.095, i.zMax - 0.03);
		o.add(R);
		const N = D(0.36, 0.09, 0.012, x, m, i.top - 0.09, i.zMax + 0.004);
		o.add(N);
		const H = D(
			0.05,
			0.012,
			0.01,
			new S({ color: 11_045_196, metalness: 0.7, roughness: 0.4 }),
			m,
			i.top - 0.09,
			i.zMax + 0.014
		);
		o.add(H);
		for (const K of [i.xMin + 0.035, i.xMax - 0.035]) {
			for (const He of [i.zMin + 0.035, i.zMax - 0.035]) {
				o.add(D(0.05, i.top - 0.035, 0.05, x, K, (i.top - 0.035) / 2, He));
			}
		}
		const q = ut(256, 160, (K) => {
				(K.fillStyle = "#5b2a2c"), K.fillRect(0, 0, 256, 160);
				const He = $e(31);
				for (let Qe = 0; Qe < 400; Qe++) {
					(K.fillStyle = `rgba(30, 14, 16, ${0.05 + He() * 0.12})`),
						K.fillRect(He() * 256, He() * 160, 1 + He() * 5, 1 + He() * 3);
				}
				(K.fillStyle = "#eee4cc"),
					K.fillRect(44, 44, 168, 72),
					(K.strokeStyle = "#7a3a2a"),
					(K.lineWidth = 2),
					K.strokeRect(50, 50, 156, 60),
					(K.fillStyle = "#243466"),
					(K.font = '22px "Patrick Hand", cursive'),
					(K.textAlign = "center"),
					K.fillText("ATTENDANCE", 128, 76),
					K.fillText("IX - A", 128, 102);
			}),
			$ = new A(new Me(0.36, 0.028, 0.23), [
				x,
				x,
				new S({ map: q, roughness: 0.9 }),
				new S({ color: 4_858_404, roughness: 0.9 }),
				new S({ color: 14_274_744, roughness: 1 }),
				new S({ color: 14_274_744, roughness: 1 }),
			]);
		$.position.set(m - 0.12, i.top + 0.014, v + 0.05),
			($.rotation.y = 0.12),
			($.castShadow = !0),
			o.add($);
		const ee = D(
			0.16,
			0.035,
			0.07,
			new S({ color: 14_141_806, roughness: 0.78 }),
			m + 0.22,
			i.top + 0.0175,
			v - 0.16
		);
		(ee.rotation.y = -0.3), o.add(ee);
		const fe = new ue(),
			ge = new S({ color: 7_303_532, metalness: 0.6, roughness: 0.45 }),
			ct = new S({ color: 9_068_592, roughness: 0.85 });
		fe.add(D(0.42, 0.018, 0.4, ct, 0, 0.45, 0)),
			fe.add(D(0.42, 0.24, 0.016, ct, 0, 0.72, -0.19));
		for (const K of [-0.19, 0.19]) {
			fe.add(D(0.02, 0.45, 0.02, ge, K, 0.225, 0.18)),
				fe.add(D(0.02, 0.86, 0.02, ge, K, 0.43, -0.18)),
				fe.add(D(0.02, 0.02, 0.36, ge, K, 0.3, 0));
		}
		fe.position.set(m + 0.05, 0, i.zMin - 0.28),
			(fe.rotation.y = 0.35),
			o.add(fe);
	}
	const O = vo();
	O.position.set(h.x, 0, h.z), o.add(O);
	const ce = 0.14,
		Y = 1,
		ve = 2.28,
		Q = 1.3,
		X = [2.2, 4.05, 5.9],
		j = [3.7, 5.6],
		oe = { from: 0.5, to: 1.45 },
		se = 2.12,
		Z = (l, g) => {
			const m = l < 0 ? 1 : -1,
				v = new ue(),
				x = (b, y, R, N, H) => {
					if (y - b <= 0.001 || N - R <= 0.001) {
						return;
					}
					const q = D(
						ce,
						N - R,
						y - b,
						H,
						l - (m * ce) / 2,
						(R + N) / 2,
						(b + y) / 2,
						!1
					);
					(q.receiveShadow = !0), v.add(q);
				},
				k = [0, ...g.flatMap((b) => [b.from, b.to]), M];
			for (let b = 0; b < k.length; b += 2) {
				const y = k[b],
					R = k[b + 1];
				x(y, R, 0, 1.1, pn), x(y, R, 1.1, 1.13, mn), x(y, R, 1.13, p, wt);
			}
			for (const b of g) {
				x(b.from, b.to, 0, Math.min(b.bottom, 1.1), pn),
					b.bottom > 1.1 &&
						(x(b.from, b.to, 1.1, 1.13, mn),
						x(b.from, b.to, 1.13, b.bottom, wt)),
					x(b.from, b.to, b.top, p, wt);
			}
			o.add(v);
		};
	Z(
		-a,
		X.map((l) => ({ bottom: Y, from: l - Q / 2, to: l + Q / 2, top: ve }))
	),
		Z(a, [
			{ bottom: 0, from: oe.from, to: oe.to, top: se },
			...j.map((l) => ({ bottom: Y, from: l - Q / 2, to: l + Q / 2, top: ve })),
		]);
	const V = new ft({ color: 16_183_516 }),
		ae = (l, g) => {
			const m = l < 0 ? 1 : -1,
				v = new ue(),
				x = new S({ color: 6_448_723, roughness: 0.85 }),
				k = ve - Y;
			for (const y of [-Q / 2, Q / 2]) {
				v.add(D(ce + 0.02, k, 0.07, x, 0, k / 2, y));
			}
			v.add(D(ce + 0.02, 0.07, Q + 0.07, x, 0, k - 0.035, 0)),
				v.add(D(ce + 0.1, 0.05, Q + 0.14, x, m * 0.02, -0.025, 0));
			for (let y = 1; y < 6; y++) {
				v.add(
					D(0.016, k - 0.1, 0.016, gn, m * 0.02, k / 2, -Q / 2 + (Q / 6) * y)
				);
			}
			for (const y of [k * 0.33, k * 0.66]) {
				v.add(D(0.016, 0.016, Q - 0.1, gn, m * 0.02, y, 0));
			}
			v.position.set(l, Y, g), on(v), o.add(v);
			const b = new A(new te(Q + 0.6, k + 0.6), V);
			b.position.set(l - m * 0.6, Y + k / 2, g),
				(b.rotation.y = (m * Math.PI) / 2),
				o.add(b);
		};
	for (const l of X) {
		ae(-a, l);
	}
	for (const l of j) {
		ae(a, l);
	}
	const C = new A(new te(M, p), new S({ map: Ot(!1), roughness: 0.95 }));
	C.position.set(a + 1.8, p / 2, M / 2),
		(C.rotation.y = -Math.PI / 2),
		o.add(C);
	{
		const l = oe.to - oe.from,
			g = 0.045,
			m = new S({ color: 5_204_823, roughness: 0.6 }),
			v = new S({ color: 4_481_101, roughness: 0.65 }),
			x = new ue();
		x.position.set(a, 0, oe.to);
		const k = new ue();
		k.add(D(g, se - 0.02, l, m, 0, (se - 0.02) / 2, -l / 2));
		for (const [R, N] of [
			[0.55, 0.7],
			[1.5, 0.85],
		]) {
			k.add(D(0.012, N, l - 0.22, v, -g / 2 - 0.002, R, -l / 2));
		}
		const b = D(
			0.02,
			0.03,
			0.16,
			new S({ color: 3_815_992, metalness: 0.7, roughness: 0.5 }),
			-g / 2 - 0.012,
			1.02,
			-l + 0.16
		);
		k.add(b), x.add(k), (x.rotation.y = -Math.PI * 0.42), o.add(x);
		const y = new S({ color: 5_982_774, roughness: 0.8 });
		for (const R of [oe.from - 0.04, oe.to + 0.04]) {
			o.add(D(ce + 0.04, se, 0.08, y, a - ce / 2, se / 2, R));
		}
		o.add(
			D(
				ce + 0.04,
				0.08,
				l + 0.16,
				y,
				a - ce / 2,
				se + 0.04,
				(oe.from + oe.to) / 2
			)
		);
	}
	const de = ko();
	de.group.position.set(tt.x, tt.y, tt.z),
		(de.group.rotation.z = 0.02),
		o.add(de.group),
		de.group.updateMatrixWorld(!0),
		de.centre.setFromMatrixPosition(de.group.matrixWorld),
		de.group.getWorldDirection(de.facing);
	const ke = new A(new te(P, 2.5), new S({ map: Ot(!1), roughness: 0.95 }));
	ke.position.set(0, 1.25, M), (ke.rotation.y = Math.PI), o.add(ke);
	const Se = new A(new te(P, p - 2.5), wt);
	Se.position.set(0, 2.5 + (p - 2.5) / 2, M),
		(Se.rotation.y = Math.PI),
		o.add(Se);
	{
		const l = D(
			1.1,
			0.75,
			0.03,
			new S({ color: 7_031_349, roughness: 0.95 }),
			-0.6,
			1.75,
			M - 0.02,
			!1
		);
		o.add(l);
		const g = $e(5);
		for (let m = 0; m < 4; m++) {
			const v = new A(
				new te(0.21, 0.29),
				new S({ map: qn(m), roughness: 0.95 })
			);
			v.position.set(-1 + m * 0.27, 1.75 + (g() - 0.5) * 0.06, M - 0.04),
				(v.rotation.y = Math.PI),
				(v.rotation.z = (g() - 0.5) * 0.08),
				o.add(v);
		}
	}
	for (const l of [2.9, 5.6]) {
		const g = D(
			1.24,
			0.045,
			0.09,
			new S({ color: 15_262_938, roughness: 0.6 }),
			0,
			p - 0.03,
			l,
			!1
		);
		o.add(g);
		const m = new A(
			new Be(0.017, 0.017, 1.2, 12),
			new S({ color: 14_212_308, roughness: 0.3 })
		);
		(m.rotation.z = Math.PI / 2), m.position.set(0, p - 0.075, l), o.add(m);
	}
	const L = { left: Nt(-0.9, E.fan.z), right: Nt(E.fan.x, E.fan.z) };
	o.add(L.left.group, L.right.group);
	for (const l of [-0.9, E.fan.x]) {
		const g = Nt(l, E.fan.z + 3.2);
		(g.spinner.rotation.y = l < 0 ? 0.4 : 1.7), o.add(g.group);
	}
	const xe = Un(),
		ze = new S({ color: 10_258_269, map: xe, roughness: 0.85 }),
		qe = $e(7);
	for (let l = 0; l < c.count; l++) {
		const g = c.firstFarEdge + c.pitch * l;
		for (const m of [-1, 1]) {
			const v = new ue(),
				x = m * n.blockX,
				k = g + n.depth / 2,
				b = D(n.width, 0.03, n.depth, ze, 0, n.height - 0.015, 0);
			v.add(b);
			const y = n.width / 2 - 0.045,
				R = n.depth / 2 - 0.035;
			for (const $ of [-y, y]) {
				for (const ee of [-R, R]) {
					v.add(
						D(0.026, n.height - 0.03, 0.026, ht, $, (n.height - 0.03) / 2, ee)
					);
				}
				v.add(D(0.02, 0.02, n.depth - 0.09, ht, $, n.height * 0.58, 0));
			}
			v.add(D(n.width - 0.12, 0.02, 0.02, ht, 0, n.height * 0.58, -R));
			const N = D(
				n.width - 0.1,
				0.16,
				0.014,
				bo,
				0,
				n.height - 0.12,
				-0.42 / 2 + 0.012
			);
			v.add(N);
			const H = n.depth / 2 + 0.16;
			v.add(D(n.width - 0.02, 0.02, 0.25, un, 0, 0.45, H)),
				v.add(D(n.width - 0.02, 0.1, 0.014, un, 0, 0.6, H + 0.115));
			for (const $ of [-y, y]) {
				v.add(D(0.024, 0.45, 0.024, ht, $, 0.225, H)),
					v.add(D(0.02, 0.02, H - R, ht, $, n.height * 0.58, (H + R) / 2)),
					v.add(D(0.02, 0.2, 0.02, ht, $, 0.55, H + 0.115));
			}
			v.position.set(x, 0, k);
			const q = l === Lt.third || l === Lt.middle || l === Lt.last;
			(v.rotation.y = q ? 0 : (qe() - 0.5) * 0.05), on(v), o.add(v);
		}
	}
	{
		const l = new S({ color: 13_157_558, metalness: 0.75, roughness: 0.32 }),
			g = new A(new Be(0.03, 0.033, 0.22, 18), l);
		g.position.set(
			n.blockX + 0.35,
			n.height + 0.11,
			c.firstFarEdge + c.pitch * 2 + 0.2
		),
			(g.castShadow = !0),
			o.add(g);
		const m = new ue();
		for (const [k, [b, y]] of [
			["Priya", "Maths"],
			["Golu", "Science"],
		].entries()) {
			const R = new A(new Me(0.17, 0.012, 0.22), [
				Ie,
				Ie,
				new S({ map: tn(k + 3, b, y), roughness: 0.9 }),
				Ie,
				new S({ color: 15_261_900, roughness: 1 }),
				new S({ color: 15_261_900, roughness: 1 }),
			]);
			R.position.set(k * 0.01, 0.006 + k * 0.012, -k * 0.015),
				(R.rotation.y = k * 0.15 - 0.1),
				(R.castShadow = !0),
				m.add(R);
		}
		m.position.set(-0.85 - 0.3, n.height, c.firstFarEdge + c.pitch * 3 + 0.2),
			o.add(m);
		{
			const k = new S({
					color: 15_854_034,
					flatShading: !0,
					roughness: 1,
					side: ot,
				}),
				b = new ue(),
				y = 0.155,
				R = 0.052;
			for (const N of [-1, 1]) {
				const H = new bn();
				H.setAttribute(
					"position",
					new Xn([0, 0, -y * 0.5, 0, 0, y * 0.5, N * R, -0.008, y * 0.42], 3)
				),
					H.computeVertexNormals();
				const q = new A(H, k);
				(q.castShadow = !0), b.add(q);
				const $ = new A(new te(y * 0.94, 0.013), k);
				($.rotation.y = Math.PI / 2), $.position.set(0, 0.006, 0), b.add($);
			}
			b.position.set(
				-0.85 + 0.18,
				n.height + 0.004,
				c.firstFarEdge + c.pitch * 2 + 0.07
			),
				b.rotation.set(0.04, 2.35, 0.06),
				o.add(b);
		}
		let v = !1;
		const x = (k) => {
			var fe;
			if (s || v) {
				return;
			}
			v = !0;
			const b = k.scene;
			b.updateMatrixWorld(!0);
			const y = new Vn().setFromObject(b),
				R = y.getSize(new re()),
				N = y.getCenter(new re()),
				H = 0.32 / R.y,
				q = (ge, ct, K, He) => {
					const Qe = b.clone(!0);
					Qe.traverse((Pn) => {
						const dt = Pn;
						if (!dt.isMesh) {
							return;
						}
						dt.castShadow = !0;
						const Zt = (Wt) => {
							const Dt = Wt.clone();
							return (
								Wt.name === "Backpack"
									? Dt.color.setHex(ge)
									: Wt.name === "Brown2" && Dt.color.setHex(ct),
								Dt
							);
						};
						dt.material = Array.isArray(dt.material)
							? dt.material.map(Zt)
							: Zt(dt.material);
					});
					const zt = new ue();
					Qe.scale.setScalar(H),
						Qe.position.set(-N.x * H, -y.min.y * H, -N.z * H),
						zt.add(Qe),
						zt.position.set(...K),
						zt.rotation.set(...He),
						o.add(zt);
				},
				$ = (ge) => c.firstFarEdge + c.pitch * ge + n.depth + 0.16,
				ee = 0.46;
			q(
				4_149_884,
				2_504_276,
				[n.blockX - 0.38, n.height, c.firstFarEdge + c.pitch + 0.16],
				[-0.18, 0.5, 0.1]
			),
				q(7_024_431, 2_825_501, [-0.85 + 0.4, ee, $(4)], [0.1, -0.9, 0.08]),
				q(4_149_884, 2_504_276, [n.blockX + 0.2, ee, $(5)], [-0.05, 2.4, 0]),
				q(
					3_099_194,
					1_977_636,
					[-0.85 - 0.55, 0.002, c.firstFarEdge + c.pitch * 3 + 0.55],
					[0, 1.1, 0.18]
				),
				(fe = e.onChange) == null || fe.call(e);
		};
		Xt
			? x(Xt)
			: kn.then((k) => {
					k && x(k);
				});
	}
	const he = new ue(),
		De = new A(new Me(0.17, 0.014, 0.22), [
			Ie,
			Ie,
			new S({ map: tn(11, "", "Rough"), roughness: 0.9 }),
			Ie,
			new S({ color: 15_261_900, roughness: 1 }),
			new S({ color: 15_261_900, roughness: 1 }),
		]);
	De.position.set(-0.3, 0.007, 0.06),
		(De.rotation.y = 0.08),
		(De.castShadow = !0),
		he.add(De);
	const Ue = ut(256, 340, (l) => {
			(l.fillStyle = "#f3ecd8"),
				l.fillRect(0, 0, 256, 340),
				(l.strokeStyle = "rgba(90, 120, 170, 0.45)"),
				(l.lineWidth = 1);
			for (let g = 34; g < 340; g += 17) {
				l.beginPath(), l.moveTo(0, g), l.lineTo(256, g), l.stroke();
			}
			(l.strokeStyle = "rgba(190, 60, 50, 0.55)"),
				(l.lineWidth = 1.5),
				l.beginPath(),
				l.moveTo(30, 0),
				l.lineTo(30, 340),
				l.stroke();
		}),
		pe = new A(
			new te(0.155, 0.205, e.windCues ? 8 : 1, 1),
			new S({ map: Ue, roughness: 1, side: ot })
		);
	e.windCues &&
		(pe.geometry.boundingSphere = new Yn(new re(0, 0, 0.045), 0.17)),
		(pe.rotation.x = -Math.PI / 2),
		(pe.rotation.z = -0.12),
		pe.position.set(-0.27, 0.0155, 0.05),
		(pe.castShadow = !0),
		he.add(pe);
	const me = bt(1);
	he.add(me), o.add(he);
	const Fe = e.windCues ? wo() : null;
	Fe && o.add(Fe.mesh);
	let pt = 0;
	const vt = 1,
		Ze = Array.from({ length: vt }, () => {
			const l = bt(1);
			(l.visible = !1), o.add(l);
			const g = new A(
				new qt(be.radius * 1.5, 20).rotateX(-Math.PI / 2),
				new ft({
					color: 2_761_752,
					depthWrite: !1,
					opacity: 0,
					transparent: !0,
				})
			);
			return (g.visible = !1), o.add(g), { mesh: l, shade: g };
		}),
		st = 9,
		kt = 12,
		Ce = [],
		Ke = [];
	let at = 0;
	const Xe = new ft({
			color: 2_761_752,
			depthWrite: !1,
			opacity: 0.3,
			transparent: !0,
		}),
		it = (l) => {
			o.remove(l), l.geometry.dispose();
			for (const g of l.children) {
				g instanceof A && g.geometry.dispose();
			}
		},
		Re = (l, g) => {
			const m = E.bin.rimRadius - be.radius - 0.012,
				v = (l % st) / st,
				x = m * Math.sqrt(v),
				k = l * 2.399,
				b = E.bin.rimHeight - be.radius * 0.6,
				y = E.bin.fill + be.radius,
				R = x / m;
			return g.set(
				E.bin.x + Math.cos(k) * x,
				y + (b - y) * (1 - R * R),
				E.bin.z + Math.sin(k) * x
			);
		},
		rt = new re(),
		r = (l, g) => {
			const m = bt(0.94 + Math.random() * 0.12);
			if (
				(m.rotation.set(
					Math.random() * 6,
					Math.random() * 6,
					Math.random() * 6
				),
				g)
			) {
				for (
					Re(at++, rt), m.position.copy(rt), o.add(m), Ce.push(m);
					Ce.length > st;
				) {
					const x = Ce.shift();
					x && it(x);
				}
				Ce.forEach((x, k) => x.position.copy(Re(at - Ce.length + k, rt)));
				return;
			}
			m.position.set(l.x, Math.max(l.y, be.radius * 0.9), l.z);
			const v = new A(new qt(be.radius * 1.35, 16).rotateX(-Math.PI / 2), Xe);
			for (
				v.position.set(0, -0.025 * 0.92, 0), m.add(v), o.add(m), Ke.push(m);
				Ke.length > kt;
			) {
				const x = Ke.shift();
				x && it(x);
			}
		},
		w = () => {
			for (const l of [...Ce, ...Ke]) {
				it(l);
			}
			for (const l of Pe) {
				o.remove(l.mesh), l.mesh.geometry.dispose();
			}
			(Pe.length = 0), (Ce.length = 0), (Ke.length = 0), (at = 0);
		},
		I = [];
	let _ = 0;
	const ie = () => {
			I.length = 0;
			for (const { mesh: l, shade: g } of Ze) {
				(l.visible = !1), (g.visible = !1);
			}
			(me.visible = !0), Ve();
		},
		Ee = (l, g = {}) => {
			const m = _;
			_ = (_ + 1) % vt;
			const v = I.findIndex((R) => R.slot === m);
			if (v >= 0) {
				const R = I[v],
					N = R.result.path[R.result.path.length - 1];
				r(N, R.result.made), I.splice(v, 1);
			}
			const { mesh: x, shade: k } = Ze[m];
			(x.visible = !0), (k.visible = !0);
			const b = l.path[0],
				y = me.getWorldPosition(new re());
			x.position.copy(y),
				I.push({
					contact: 0,
					decided: !1,
					hooks: g,
					result: l,
					slot: m,
					spinAxis: new re(
						Math.random() - 0.5,
						Math.random() - 0.5,
						Math.random() - 0.5
					).normalize(),
					spinRate: 7 + Math.random() * 6,
					startOffset: y.sub(new re(b.x, b.y, b.z)),
					t: 0,
				}),
				(me.visible = !1);
		},
		Oe = 60,
		Ye = new re(),
		je = new re(),
		mt = (l) => {
			var g, m, v;
			for (let x = I.length - 1; x >= 0; x--) {
				const k = I[x],
					{ result: b, hooks: y } = k,
					{ mesh: R, shade: N } = Ze[k.slot];
				k.t += l;
				const H = k.t * Oe,
					q = Math.min(b.path.length - 2, Math.floor(H)),
					$ = Math.min(1, Math.max(0, H - q));
				Ye.set(b.path[q].x, b.path[q].y, b.path[q].z),
					je.set(b.path[q + 1].x, b.path[q + 1].y, b.path[q + 1].z),
					R.position.lerpVectors(Ye, je, $),
					R.position.addScaledVector(
						k.startOffset,
						Math.max(0, 1 - k.t / 0.1) ** 2
					);
				const ee = Ye.distanceTo(je) * Oe;
				R.rotateOnAxis(k.spinAxis, k.spinRate * Math.min(1, ee / 3) * l),
					N.position.set(R.position.x, 0.004, R.position.z);
				const fe = Math.max(0, R.position.y),
					ge = 1 + fe * 0.55;
				if (
					(N.scale.set(ge, ge, ge),
					(N.material.opacity = Math.max(0, 0.34 - fe * 0.1)),
					k.contact < b.contacts.length &&
						k.t > b.flight * (0.82 + k.contact * 0.06) &&
						((g = y.onContact) == null ||
							g.call(y, b.contacts[k.contact++], ee)),
					!k.decided &&
						k.t >= b.flight &&
						((k.decided = !0), (m = y.onDecided) == null || m.call(y, b)),
					k.t >= b.settle)
				) {
					const ct = b.path[b.path.length - 1];
					(R.visible = !1),
						(N.visible = !1),
						r(ct, b.made),
						I.splice(x, 1),
						(me.visible = !0),
						(v = y.onSettled) == null || v.call(y, b);
				}
			}
		};
	let Te = !1;
	const gt = (l, g) => {
			Te = !0;
			const m = xt(l, Ct),
				v = Math.min(1, Math.max(0, g)),
				x = (Ne(Ct) - m.x) / he.scale.x;
			me.position.set(
				-0.06 + (x + 0.06) * v,
				be.radius + (Ge.height - m.y) * v,
				0.06 + (We(l) - m.z) * v
			),
				(me.rotation.z = v * 0.55);
		},
		Ve = () => {
			(Te = !1), me.position.set(-0.06, be.radius, 0.06), (me.rotation.z = 0);
		},
		Pe = [],
		lt = -9.81,
		Je = (l) => {
			const g = l === "big" ? 22 : 9;
			for (let m = 0; m < g; m++) {
				const v = bt(0.85 + Math.random() * 0.3),
					x = Math.random() < 0.5 ? -1 : 1,
					k = 1 + Math.floor(Math.random() * (c.count - 2));
				v.position.set(
					x * (n.blockX + (Math.random() - 0.5) * n.width * 0.8),
					n.height + 0.1 + Math.random() * 0.2,
					c.firstFarEdge + c.pitch * k + Math.random() * 0.4
				),
					o.add(v),
					Pe.push({
						mesh: v,
						rate: 6 + Math.random() * 8,
						spin: new re(
							Math.random() - 0.5,
							Math.random() - 0.5,
							Math.random() - 0.5
						).normalize(),
						t: 0,
						vel: new re(
							-x * (0.4 + Math.random() * 0.9),
							3.4 + Math.random() * 2.2,
							(Math.random() - 0.5) * 1.2
						),
					});
			}
		},
		En = (l) => {
			for (let g = Pe.length - 1; g >= 0; g--) {
				const m = Pe[g];
				(m.t += l),
					(m.vel.y += lt * l),
					m.mesh.position.addScaledVector(m.vel, l),
					m.mesh.rotateOnAxis(m.spin, m.rate * l),
					(m.mesh.position.y <= be.radius || m.t > 6) &&
						((m.mesh.position.y = be.radius),
						o.remove(m.mesh),
						m.mesh.geometry.dispose(),
						Pe.splice(g, 1),
						r(
							{ x: m.mesh.position.x, y: be.radius, z: m.mesh.position.z },
							!1
						));
			}
		},
		St = new A(new Me(0.6, 0.5, 2.1), Ft);
	o.add(St);
	const jt = new re();
	let Ct = "left";
	const Vt = (l, g = "left") => {
		Ct = g;
		const m = xt(l, g);
		(he.scale.x = g === "right" ? -1 : 1),
			he.position.set(Ne(g), n.height, m.z - 0.06),
			me.position.set(-0.06, be.radius, 0.06);
		const v = g === "right" ? "left" : "right",
			x = v === "right" ? 1 : -1;
		St.position.set(Ne(v) + x * 0.3, n.height, We(l) - 0.7),
			jt.set(Ne(v) + x * 0.22, n.height + 0.02, We(l) - c.pitch),
			St.updateMatrixWorld(!0);
	};
	return (
		Vt("third"),
		{
			get animated() {
				return (
					I.length > 0 ||
					Pe.length > 0 ||
					Te ||
					L.left.omega > 0.01 ||
					L.right.omega > 0.01
				);
			},
			book: De,
			cancelThrow: ie,
			celebrate: Je,
			clearLitter: w,
			dispose() {
				s ||
					((s = !0), ie(), w(), Xe.dispose(), oo(o, new Set([t])), o.clear());
			},
			endPull: Ve,
			fanHub: (l) =>
				new re(l === "left" ? -0.9 : E.fan.x, E.fan.height, E.fan.z),
			farSeat: St,
			farSeatAt: jt,
			get flying() {
				return I.length > 0;
			},
			scene: o,
			setBallReady: (l) => {
				I.length || (me.visible = l);
			},
			setBench: Vt,
			setFan: (l, g, m = !1) => {
				(L.left.target = l === "left" ? (g / 5) * 31 : 0),
					(L.right.target = l === "right" ? (g / 5) * 31 : 0),
					m &&
						((L.left.omega = L.left.target), (L.right.omega = L.right.target)),
					de.paint(l, g),
					(pt = Yt({ jitter: 0, setting: l ? g : 0 })),
					Fe == null ||
						Fe.setFan({ jitter: 0, setting: l ? g : 0, side: l || "left" });
			},
			setPull: gt,
			switchboard: de,
			throwBall: Ee,
			tick: (l) => {
				var k, b;
				mt(l),
					En(l),
					Fe == null ||
						Fe.tick(l, ((k = e.windMotion) == null ? void 0 : k.call(e)) ?? !0);
				const g = L.left.omega > L.right.omega ? L.left : L.right,
					m = Math.min(1, g.omega / 31),
					v = g === L.left ? 1 : -1,
					x = Math.sin(performance.now() * 0.006) * 0.5 + 0.5;
				if (e.windCues) {
					const y =
							(((b = e.windMotion) == null ? void 0 : b.call(e)) ?? !0)
								? x
								: 0.35,
						R = pt * (0.008 + y * 0.08),
						N = v * he.scale.x,
						H = pe.geometry.getAttribute("position"),
						q = pe.geometry.getAttribute("normal");
					for (let $ = 0; $ < H.count; $++) {
						const ee = 0.5 + (N * H.getX($)) / 0.155;
						H.setZ($, R * ee * ee);
						const fe = (2 * R * ee * N) / 0.155,
							ge = Math.hypot(fe, 1);
						q.setXYZ($, -fe / ge, 0, 1 / ge);
					}
					(H.needsUpdate = q.needsUpdate = !0),
						(pe.rotation.y = 0),
						(pe.position.y = 0.0155);
				} else {
					(pe.rotation.y = v * m * (0.1 + x * 0.16)),
						(pe.position.y = 0.0155 + m * x * 0.006);
				}
				if (!Te && me.visible) {
					const y = Math.sin(performance.now() * 0.011) * 0.5 + 0.5,
						R = Math.max(0, m - 0.25) / 0.75;
					(me.position.x = -0.06 + v * he.scale.x * R * (0.008 + y * 0.006)),
						(me.rotation.z = v * he.scale.x * R * (0.06 + y * 0.08));
				}
				for (const y of [L.left, L.right]) {
					const R = y.target > y.omega ? 9 : 3.2;
					(y.omega += (y.target - y.omega) * Math.min(1, (l * R) / 5)),
						(y.spinner.rotation.y += y.omega * l),
						(y.spinner.rotation.x =
							Math.sin(y.spinner.rotation.y * 0.5) *
							0.012 *
							Math.min(1, y.omega / 12));
					const N = y.blur.material;
					N.opacity = Math.max(0, Math.min(0.5, (y.omega - 8) / 36));
				}
			},
		}
	);
}
const zo = 560,
	It = { back: 0.66, height: 1 };
function Eo(t, e) {
	return t / e > 1.1
		? e < zo
			? "sideways"
			: "landscape"
		: t > 600
			? "pane"
			: e < t * 1.5
				? "squat"
				: "portrait";
}
const Po = { landscape: 70, pane: 100, portrait: 120, sideways: 50, squat: 90 },
	Ao = {
		landscape: { by: "height", last: 46, middle: 52, third: 58 },
		pane: { by: "height", last: 50, middle: 54, third: 60 },
		portrait: { by: "width", last: 28, middle: 36, third: 44 },
		sideways: { by: "height", last: 47, middle: 48, third: 54 },
		squat: { by: "width", last: 38, middle: 42, third: 50 },
	};
function Ro(t, e, s = {}) {
	const { w: o, h: c } = s.vp ?? Kn(),
		n = o / c;
	t.clearViewOffset(), (t.aspect = n);
	const h = Eo(o, c),
		i = We(e) + It.back;
	t.position.set(Ne(s.seat ?? "left"), It.height, i);
	const a = Ao[h],
		p =
			a.by === "height"
				? a[e]
				: (2 * Math.atan(Math.tan(((a[e] / 2) * Math.PI) / 180) / n) * 180) /
					Math.PI;
	t.fov = p;
	const M = xt(e),
		f =
			-((Math.atan2(It.height - M.y, i - M.z) * 180) / Math.PI) -
			(Po[h] / c) * p +
			p / 2,
		d = i - E.bin.z,
		u = new re(E.bin.x, It.height + Math.tan((f * Math.PI) / 180) * d, E.bin.z);
	t.lookAt(u), (t.near = 0.05), (t.far = 30), t.updateProjectionMatrix();
}
function To(t, e, s) {
	return e > 600 || s <= e
		? 0
		: Math.max(0, Math.min((s - 630) / 170, 1)) *
				{ last: 54, middle: 90, third: 144 }[t];
}
function Io(t, e, s, o, c, n = !1) {
	if (
		(Ro(t, e, { seat: s, vp: { h: c, w: o } }),
		o <= 600 &&
			c > o &&
			c < 720 &&
			((t.fov =
				(2 * Math.atan(Math.tan((t.fov * Math.PI) / 360) * 1.18) * 180) /
				Math.PI),
			t.updateProjectionMatrix()),
		n)
	) {
		const p = 2 * Math.atan(Math.tan((t.fov * Math.PI) / 360) * t.aspect),
			M = 0.03 + 2.35 / 0.88 / 2 / Math.tan(p / 2);
		t.position.set(
			t.position.x * 0.5,
			1.5,
			Math.min(t.position.z, Math.max(M, t.position.z * 0.72))
		),
			t.lookAt(0, 1.62, 0.03),
			t.updateProjectionMatrix();
	}
	t.updateMatrixWorld(!0);
	const i = ((1 - new re(0, 2.32, 0.03).project(t).y) * c) / 2,
		a =
			o <= 600 && c > o && i < 100
				? i - 100
				: Math.min(To(e, o, c), Math.max(0, i - 100));
	t.setViewOffset(o, c, 0, a, o, c), t.updateMatrixWorld(!0);
}
function _o(t, e, s) {
	return Math.max(1, Math.min(s || 1, 2, Math.sqrt(83e5 / Math.max(1, t * e))));
}
class Lo {
	constructor() {
		B(this, "samples", []);
		B(this, "last", 0);
		B(this, "lastRender", 0);
		B(this, "nextChange", 0);
		B(this, "ceiling", 0);
		B(this, "trial", null);
	}
	sample(e) {
		const {
				now: s,
				focused: o,
				rendered: c,
				canResize: n,
				ratio: h,
				ceiling: i,
			} = e,
			a = s - this.last;
		if (((this.last = s), Math.abs(this.ceiling - i) > 0.01 && n)) {
			return (
				(this.ceiling = i),
				(this.samples.length = 0),
				(this.trial = null),
				(this.nextChange = s + 3e3),
				(this.lastRender = s),
				Math.abs(h - i) > 0.01 ? i : null
			);
		}
		if (!o || a <= 0 || a > 1e3) {
			return (this.samples.length = 0), (this.lastRender = s), null;
		}
		if (!c) {
			return s - this.lastRender > 3e4 && (this.samples.length = 0), null;
		}
		if (
			((this.lastRender = s),
			this.samples.push(Math.min(a, 250)),
			this.samples.length > 180 && this.samples.shift(),
			!n || this.samples.length < 120 || s < this.nextChange)
		) {
			return null;
		}
		const p = [...this.samples].sort((u, T) => u - T),
			M = Math.floor(p.length / 10),
			P = p.slice(M, -M),
			z = P.reduce((u, T) => u + T, 0) / P.length,
			f = p.filter((u) => u > 22).length / p.length,
			d = (u, T) => ((this.samples.length = 0), (this.nextChange = s + T), u);
		if (this.trial) {
			const u = this.trial;
			return (
				(this.trial = null),
				z > u.mean * 0.88
					? d(Math.min(i, u.ratio), 3e4)
					: ((this.samples.length = 0), (this.nextChange = s + 8e3), null)
			);
		}
		return f >= 0.3 && z > 20 && h > Math.min(1.25, i) + 0.01
			? ((this.trial = { mean: z, ratio: h }),
				d(Math.max(Math.min(1.25, i), Math.round(h * 0.8 * 100) / 100), 2500))
			: this.samples.length === 180 && z < 17.8 && f < 0.05 && h < i - 0.01
				? d(Math.min(i, h + 0.25), 8e3)
				: null;
	}
}
class Fo {
	constructor() {
		B(this, "canvas", document.createElement("canvas"));
		B(this, "texture");
		B(this, "key", "");
		(this.canvas.width = 2048),
			(this.canvas.height = 896),
			(this.texture = new yn(this.canvas)),
			(this.texture.colorSpace = xn),
			(this.texture.anisotropy = 4);
	}
	draw(e, s, o) {
		const c = [e.preset, e.phase, e.bins, e.throws, e.streak, s.bins, o].join(
			":"
		);
		if (c === this.key) {
			return !1;
		}
		this.key = c;
		const n = this.canvas.getContext("2d");
		n.setTransform(2, 0, 0, 2, 0, 0);
		const h = $e(97),
			i = n.createLinearGradient(0, 0, 1024, 448);
		i.addColorStop(0, "#294237"),
			i.addColorStop(1, "#20352c"),
			(n.fillStyle = i),
			n.fillRect(0, 0, 1024, 448);
		for (let p = 0; p < 45; p++) {
			(n.strokeStyle = `rgba(230,232,203,${h() * 0.025})`),
				(n.lineWidth = 4 + h() * 20),
				n.beginPath(),
				n.moveTo(h() * 1024, h() * 448),
				n.lineTo(h() * 1024, h() * 448),
				n.stroke();
		}
		const a = (p, M, P, z, f = 920, d = !1) => {
			(n.font = `${z}px "Patrick Hand"`),
				Jn(n, h, p, M, P, {
					color: d ? "#efda9e" : "#ece8d8",
					jitter: 1,
					size: Math.min(z, (z * f) / Math.max(1, n.measureText(p).width)),
					tilt: 0.016,
				});
		};
		return (
			a("FREE PERIOD", 40, 67, 58),
			e.fan.setting > 0 && a(_t(e.preset), 675, 65, 40, 300),
			(n.strokeStyle = "#d8d6b96b"),
			(n.lineWidth = 2),
			n.beginPath(),
			n.moveTo(42, 90),
			n.lineTo(982, 90),
			n.stroke(),
			a("IN THE BIN", 45, 166, 38),
			a(e.phase === "finished" ? "THROWN" : "BALLS LEFT", 372, 166, 36),
			a("YOUR BEST", 699, 166, 36),
			a(String(e.bins), 45, 310, 150, 295, !0),
			a(String(e.phase === "finished" ? yt : e.ballsLeft), 375, 310, 130, 275),
			a(`${s.bins} / 50`, 700, 289, 74, 274),
			a(
				e.throws === 0
					? `Hi ${o}. Take your time.`
					: e.phase === "settling"
						? "The last ball still counts."
						: `${e.streak} in a row.`,
				45,
				405,
				46,
				910
			),
			(this.texture.needsUpdate = !0),
			!0
		);
	}
	dispose() {
		this.texture.dispose();
	}
}
class $t {
	constructor(e, s = crypto.randomUUID()) {
		B(this, "id");
		B(this, "phase", "ready");
		B(this, "elapsed", 0);
		B(this, "throws", 0);
		B(this, "bins", 0);
		B(this, "streak", 0);
		B(this, "bestStreak", 0);
		B(this, "marks", "");
		B(this, "pending", null);
		B(this, "readyAt", 0);
		(this.preset = e), (this.id = s);
	}
	get ballsLeft() {
		return yt - this.throws;
	}
	get fan() {
		return Qn(this.preset);
	}
	get canThrow() {
		return (
			this.phase !== "finished" &&
			this.phase !== "settling" &&
			!this.pending &&
			this.elapsed + 1e-9 >= this.readyAt &&
			this.ballsLeft > 0
		);
	}
	release(e) {
		const s = Ge.speed[_e];
		if (
			!(
				this.canThrow &&
				[e.speed, e.lateral, e.elevation].every(Number.isFinite)
			) ||
			e.speed < s.min ||
			e.speed > s.max ||
			Math.abs(e.elevation - Ge.elevation[_e]) > 1e-9 ||
			Math.abs(e.lateral - Mn(_e, Ne(et))) > Ge.maxLateral + 1e-9
		) {
			return null;
		}
		const o = mo(_e, this.fan, e, Ne(et));
		return (
			this.throws++,
			(this.phase = this.ballsLeft ? "playing" : "settling"),
			(this.pending = { at: this.elapsed, decided: !1, result: o }),
			o
		);
	}
	advance(e) {
		if (
			this.phase === "ready" ||
			this.phase === "finished" ||
			!Number.isFinite(e) ||
			e < 0
		) {
			return [];
		}
		this.elapsed += e;
		const s = [],
			o = this.pending;
		return (
			o &&
				!o.decided &&
				this.elapsed + 1e-9 >= o.at + o.result.flight &&
				((o.decided = !0),
				(this.marks += o.result.made ? "o" : "."),
				o.result.made
					? (this.bins++,
						this.streak++,
						(this.bestStreak = Math.max(this.bestStreak, this.streak)))
					: (this.streak = 0),
				s.push({ result: o.result, type: "decided" })),
			o &&
				this.elapsed + 1e-9 >= o.at + o.result.settle &&
				((this.pending = null),
				(this.readyAt = o.at + o.result.settle + eo),
				s.push({ type: "settled" })),
			!(this.ballsLeft || this.pending) &&
				((this.phase = "finished"), s.push({ type: "finished" })),
			s
		);
	}
	settleOnLeave() {
		return this.pending
			? this.advance(
					Math.max(
						0,
						this.pending.at + this.pending.result.settle - this.elapsed
					) + 1e-8
				)
			: [];
	}
}
const Co = () => ({
		best: { breeze: { bins: 0, streak: 0 }, calm: { bins: 0, streak: 0 } },
		feedbackAt: 0,
		preset: "calm",
		rules: Mt,
		taught: !1,
	}),
	Sn = (t) => `pf_free_period_v${Mt}:${t}`;
function wn(t, e) {
	var o;
	const s = Co();
	try {
		const c = JSON.parse((e ?? localStorage).getItem(Sn(t)) || "null");
		if (!c || c.rules !== Mt) {
			return s;
		}
		(s.preset = c.preset === "breeze" ? "breeze" : "calm"),
			(s.taught = c.taught === !0),
			Number.isSafeInteger(c.feedbackAt) &&
				c.feedbackAt > 0 &&
				(s.feedbackAt = c.feedbackAt);
		for (const n of ["calm", "breeze"]) {
			const h = (o = c.best) == null ? void 0 : o[n];
			Number.isInteger(h == null ? void 0 : h.bins) &&
				h.bins >= 0 &&
				h.bins <= yt &&
				Number.isInteger(h == null ? void 0 : h.streak) &&
				h.streak >= 0 &&
				h.streak <= h.bins &&
				(s.best[n] = { bins: h.bins, streak: h.streak });
		}
	} catch {}
	return s;
}
function Wo(t, e, s) {
	try {
		return (s ?? localStorage).setItem(Sn(t), JSON.stringify(e)), !0;
	} catch {
		return !1;
	}
}
function Do(t, e) {
	if (e.phase !== "finished" || e.throws !== yt || e.marks.length !== yt) {
		return !1;
	}
	const s = t.best[e.preset],
		o = e.bins > s.bins;
	return (
		(s.bins = Math.max(s.bins, e.bins)),
		(s.streak = Math.max(s.streak, e.bestStreak)),
		o
	);
}
class Oo {
	constructor(e, s, o = crypto.randomUUID(), c = !1) {
		B(this, "visitId");
		B(this, "roundIndex", 1);
		B(this, "activeSeconds", 0);
		B(this, "roundSeconds", 0);
		B(this, "idle", 0);
		B(this, "sequence", 0);
		B(this, "firstThrow", !1);
		B(this, "firstMake", !1);
		B(this, "ended", !1);
		B(this, "finished", new Set());
		B(this, "misses", {});
		(this.track = e),
			(this.visitId = o),
			c
				? (this.sequence = 1)
				: this.emit("enter", { nine_e_open: !1, source: s });
	}
	emit(e, s = {}) {
		this.track(`free_period_${e}`, {
			rules: Mt,
			seq: ++this.sequence,
			visit_id: this.visitId,
			...s,
		});
	}
	tick(e, s) {
		if (s || !Number.isFinite(e) || e < 0) {
			return;
		}
		const o = Math.min(e, Math.max(0, 30 - this.idle));
		(this.idle += e), (this.activeSeconds += o), (this.roundSeconds += o);
	}
	interaction() {
		this.idle = 0;
	}
	released(e, s) {
		this.interaction(),
			e.throws === 1 &&
				this.emit("round_start", {
					preset: e.preset,
					round_id: e.id,
					round_index: this.roundIndex,
				}),
			this.firstThrow ||
				((this.firstThrow = !0),
				this.emit("first_throw", {
					active_seconds: Math.round(this.activeSeconds),
					input: s,
					preset: e.preset,
					round_id: e.id,
				}));
	}
	decided(e, s, o) {
		o &&
			!this.firstMake &&
			((this.firstMake = !0),
			this.emit("first_make", {
				active_seconds: Math.round(this.activeSeconds),
				attempt: e.throws,
				preset: e.preset,
				round_id: e.id,
				round_index: this.roundIndex,
			})),
			o || (this.misses[s] = (this.misses[s] || 0) + 1),
			(e.marks.length === 10 || e.marks.length === 25) && this.checkpoint(e);
	}
	summary(e) {
		return {
			active_seconds: Math.round(this.roundSeconds),
			bins: e.bins,
			decided: e.marks.length,
			out: this.misses.out || 0,
			over: this.misses.over || 0,
			preset: e.preset,
			rim: this.misses.rim || 0,
			round_id: e.id,
			round_index: this.roundIndex,
			short: this.misses.short || 0,
			streak: e.bestStreak,
			wide: this.misses.wide || 0,
		};
	}
	checkpoint(e) {
		e.throws && this.emit("progress", this.summary(e));
	}
	finish(e, s) {
		e.phase !== "finished" ||
			this.finished.has(e.id) ||
			(this.finished.clear(),
			this.finished.add(e.id),
			this.emit("round_end", { ...this.summary(e), new_best: s }));
	}
	replay(e, s) {
		this.emit("replay", { preset: s, previous_round: e.id }),
			this.roundIndex++,
			(this.roundSeconds = 0),
			(this.misses = {}),
			this.interaction();
	}
	exit(e, s) {
		this.ended ||
			((this.ended = !0),
			this.emit("exit", {
				...this.summary(e),
				completed: e.phase === "finished",
				reason: s,
				visit_seconds: Math.round(this.activeSeconds),
			}));
	}
}
const zn = {
	aim: "Hard to aim",
	challenge: "Wanted more challenge",
	repeat: "Too repetitive",
	score: "Enjoyed beating my score",
	slow: "Slow on my phone",
	wind: "Wind unclear",
};
function Ho(t) {
	return (
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
			t.id
		) &&
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
			t.visitId
		) &&
		["calm", "breeze"].includes(t.preset) &&
		Number.isInteger(t.throws) &&
		t.throws >= 0 &&
		t.throws <= 50 &&
		["yes", "maybe", "no"].includes(t.again) &&
		(t.reason === "" || Object.hasOwn(zn, t.reason)) &&
		typeof t.note == "string" &&
		Array.from(t.note).length <= 280
	);
}
async function Bo(t) {
	if (!Ho(t)) {
		return !1;
	}
	try {
		const e = await to("free_period_feedback_submit", {
			p_again: t.again,
			p_id: t.id,
			p_note: t.note.trim(),
			p_preset: t.preset,
			p_reason: t.reason,
			p_rules: Mt,
			p_throws: t.throws,
			p_visit_id: t.visitId,
		});
		return (e == null ? void 0 : e.saved) === !0;
	} catch {
		return !1;
	}
}
function jo(t) {
	const { renderer: e, audio: s, player: o } = t,
		c = performance.now();
	let n = !1;
	const h = wn(o.id);
	let i = new $t(h.preset),
		a = h.preset,
		p = !0,
		M = !1,
		P = !1,
		z = !1,
		f = null,
		d = null,
		u = !0,
		T = !1,
		W = !1;
	const ne = new Lo();
	let F = h.taught,
		U = innerWidth,
		J = innerHeight,
		G = null,
		le = 0.49,
		ye = 0;
	const Ae = new AbortController(),
		we = matchMedia("(prefers-reduced-motion: reduce)"),
		O = new Oo(t.track, t.source, t.visitId, !0),
		ce = new Fo(),
		Y = So(ce.texture, {
			onChange: () => {
				u = !0;
			},
			windCues: !0,
			windMotion: () => !we.matches,
		}),
		ve = new no(),
		Q = e.getPixelRatio();
	e.setPixelRatio(Math.min(devicePixelRatio || 1, 2)), Y.setBench(_e, et);
	const X = document.createElement("section");
	(X.className = "free-period-root"),
		X.setAttribute("aria-label", "Free Period"),
		(X.innerHTML = `
    <div class="fp-gesture" tabindex="0" role="application" aria-label="Throw a paper ball. Swipe upwards from the ball. Keyboard: up and down change length, left and right aim, Space throws."></div>
    <nav class="fp-chrome" aria-label="Free Period controls">
      <button type="button" class="fp-quiet" data-fp="exit">← Corridor</button>
      <button type="button" class="fp-quiet" data-fp="menu" aria-haspopup="dialog">Menu</button>
    </nav>
    <div class="fp-wind" aria-live="polite"></div>
    <aside class="chit fp-teaching" aria-label="How to throw">
      <p class="fp-hint"></p><p class="fp-instruction">Start on the paper ball.</p>
      <button type="button" class="fp-skip">Got it</button>
    </aside>
    <p class="fp-live" role="status" aria-live="polite" aria-atomic="true"></p>
    <div class="chitwrap fp-overlay" hidden><section class="chit fp-sheet" role="dialog" aria-modal="true" tabindex="-1"></section></div>`),
		document.body.append(X);
	const j = X.querySelector(".fp-gesture"),
		oe = X.querySelector(".fp-wind"),
		se = X.querySelector(".fp-teaching"),
		Z = X.querySelector(".fp-hint"),
		V = X.querySelector(".fp-live"),
		ae = X.querySelector(".fp-overlay"),
		C = X.querySelector(".fp-sheet"),
		de = X.querySelector(".fp-chrome"),
		ke = [...document.body.children]
			.filter((r) => r instanceof HTMLElement && r !== X)
			.map((r) => ({ el: r, inert: r.inert }));
	for (const { el: r } of ke) {
		r.inert = !0;
	}
	document.body.classList.add("free-period-active");
	const Se = e.domElement.getAttribute("aria-label");
	e.domElement.setAttribute("aria-label", "Free Period classroom");
	function L(r, w, I = "") {
		const _ = document.createElement(r);
		return (_.textContent = w), (_.className = I), _;
	}
	function xe(r, w, I = "fp-quiet") {
		const _ = document.createElement("button");
		return (
			(_.type = "button"),
			(_.className = I),
			(_.textContent = r),
			_.addEventListener("click", w),
			_
		);
	}
	function ze() {
		if (t.preview) {
			return;
		}
		const r = wn(o.id);
		for (const w of ["calm", "breeze"]) {
			(h.best[w].bins = Math.max(h.best[w].bins, r.best[w].bins)),
				(h.best[w].streak = Math.max(h.best[w].streak, r.best[w].streak));
		}
		(h.feedbackAt = Math.max(h.feedbackAt, r.feedbackAt)), (p = Wo(o.id, h));
	}
	function qe(r) {
		(Z.textContent = r), (V.textContent = r);
	}
	function he() {
		const r = G == null ? void 0 : G.id;
		(G = null),
			r !== void 0 && j.hasPointerCapture(r) && j.releasePointerCapture(r),
			Y.endPull(),
			(u = !0);
	}
	function De() {
		const r = i.fan;
		s.setFreePeriodFan(r.setting),
			Y.setFan(r.setting ? r.side : null, r.setting, !0),
			(oe.textContent = r.setting ? "Wind →  ▰▰▱▱▱  2/5" : ""),
			oe.setAttribute(
				"aria-label",
				r.setting
					? "Wind pushes right, strength 2 out of 5. Aim a little left."
					: ""
			),
			(u = !0);
	}
	function Ue() {
		ce.draw(i, h.best[i.preset], o.name) && (u = !0),
			(se.hidden = F || !!f),
			(oe.hidden = !!f || i.fan.setting === 0),
			(X.dataset.phase = i.phase),
			(X.dataset.throws = String(i.throws)),
			T !== i.canThrow && ((T = i.canThrow), (u = !0)),
			Y.setBallReady(i.canThrow);
	}
	function pe() {
		(f = null),
			(ae.hidden = !0),
			ae.classList.remove("show"),
			C.replaceChildren(),
			(j.inert = !1),
			(de.inert = !1),
			(u = !0),
			d != null && d.isConnected
				? d.focus({ preventScroll: !0 })
				: j.focus({ preventScroll: !0 }),
			Ue();
	}
	function me(r, w) {
		he(),
			f ||
				(d =
					document.activeElement instanceof HTMLElement
						? document.activeElement
						: j),
			(f = r),
			C.replaceChildren(),
			C.setAttribute("aria-label", w),
			(ae.hidden = !1),
			ae.classList.add("show"),
			(j.inert = !0),
			(de.inert = !0),
			C.append(L("p", "FREE PERIOD", "fp-kicker"), L("h1", w, "fp-heading")),
			Ue(),
			C.focus({ preventScroll: !0 });
	}
	function Fe(r) {
		if (!t.allowed()) {
			t.onExit();
			return;
		}
		if (!(i.throws > 0 && i.phase !== "finished")) {
			(a = r),
				(h.preset = r),
				ze(),
				O.emit("setting", { preset: r }),
				i.throws === 0 &&
					((i = new $t(r)),
					r === "breeze" && !F && qe("Wind pushes right. Aim a little left."),
					De());
			for (const w of C.querySelectorAll("input[name=fp-preset]")) {
				w.checked = w.value === r;
			}
		}
	}
	function pt() {
		const r = document.createElement("fieldset");
		(r.className = "fp-presets"),
			r.append(L("legend", "For this round")),
			i.phase === "finished" &&
				(r.firstElementChild.textContent = "Next round");
		for (const w of ["calm", "breeze"]) {
			const I = document.createElement("label"),
				_ = document.createElement("input");
			(_.type = "radio"),
				(_.name = "fp-preset"),
				(_.value = w),
				(_.checked = a === w),
				_.addEventListener("change", () => Fe(w)),
				I.append(_, L("span", _t(w))),
				r.append(I);
		}
		return r;
	}
	function vt() {
		if (!(M || i.phase !== "finished")) {
			if (!t.allowed()) {
				t.onExit();
				return;
			}
			O.replay(i, a),
				(i = new $t(a)),
				Y.cancelThrow(),
				Y.clearLitter(),
				(le = 0.49),
				(ye = 0),
				De(),
				pe(),
				j.focus({ preventScroll: !0 }),
				(V.textContent = "50 fresh paper balls. Take your time.");
		}
	}
	function Ze(r = !1) {
		me("result", r ? "Your new best." : "Another go?"),
			C.append(
				L("p", `${i.bins} / 50`, "fp-result-score"),
				L("p", `in the bin · ${_t(i.preset).toLowerCase()}`, "fp-result-label")
			);
		const w = document.createElement("div");
		(w.className = "fp-result-detail"),
			w.append(
				L("p", `Your best: ${h.best[i.preset].bins} / 50`),
				L("p", `Longest streak: ${i.bestStreak}`)
			),
			C.append(w, pt());
		const I = document.createElement("div");
		I.className = "fp-actions";
		const _ = xe("Play again", vt, "stampbtn fp-primary");
		if (
			((_.dataset.fp = "replay"),
			I.append(_, xe("Corridor", t.onExit)),
			C.append(I),
			C.append(
				L(
					"p",
					p
						? "Best on this device."
						: "Your best could not be saved on this device.",
					"fp-footnote"
				)
			),
			Date.now() - h.feedbackAt > 7 * 864e5)
		) {
			(h.feedbackAt = Date.now()), ze();
			const ie = document.createElement("div");
			(ie.className = "fp-feedback-ask"),
				ie.append(
					xe("Worth keeping for free periods?", kt),
					xe("Not now", () => {
						(h.feedbackAt = Date.now()), ze(), ie.remove();
					})
				),
				C.append(ie),
				O.emit("feedback", { action: "shown" });
		}
		_.focus({ preventScroll: !0 }),
			(V.textContent = `${i.bins} out of 50. Longest streak ${i.bestStreak}.`);
	}
	function st() {
		me("menu", "Take your time."),
			C.append(L("p", `${o.maker} kept a seat for you.`, "fp-copy")),
			i.throws
				? C.append(
						L("p", `${_t(i.preset)} · ${i.ballsLeft} balls left`, "fp-copy")
					)
				: C.append(pt());
		const r = xe("", () => {
				t.sound.setSoundOn(!t.sound.soundOn()), w();
			}),
			w = () => {
				(r.textContent = `All sounds: ${t.sound.soundOn() ? "on" : "off"}`),
					r.setAttribute("aria-pressed", String(t.sound.soundOn()));
			};
		w(),
			C.append(
				r,
				xe("How to throw", () => {
					(F = !1),
						qe(
							matchMedia("(pointer: coarse)").matches
								? "Swipe up. Then let go."
								: "Drag up. Then release."
						),
						pe();
				}),
				xe("Tell us what you think", kt)
			),
			C.append(
				L("p", "Keyboard: ↑ ↓ length, ← → aim, Space to throw.", "fp-footnote")
			),
			C.append(
				L(
					"p",
					p
						? "Your best is saved on this device. Leaving starts a new round."
						: "Saving is unavailable on this device. Leaving starts a new round.",
					"fp-footnote"
				)
			),
			C.append(xe("Back to the ball", pe, "stampbtn fp-primary"));
	}
	function kt() {
		const r = i.phase === "finished";
		me("feedback", "Would you play again?"),
			O.emit("feedback", { action: "opened" });
		const w = document.createElement("form");
		w.className = "fp-feedback-form";
		const I = document.createElement("fieldset");
		(I.className = "fp-presets"),
			I.append(L("legend", "Would you play this again?"));
		for (const [Ve, Pe] of [
			["yes", "Yes"],
			["maybe", "Maybe"],
			["no", "No"],
		]) {
			const lt = document.createElement("label"),
				Je = document.createElement("input");
			(Je.type = "radio"),
				(Je.name = "again"),
				(Je.value = Ve),
				(Je.required = !0),
				lt.append(Je, L("span", Pe)),
				I.append(lt);
		}
		const _ = document.createElement("select");
		(_.id = "fp-feedback-reason"),
			_.append(new Option("Choose a reason (optional)", ""));
		for (const [Ve, Pe] of Object.entries(zn)) {
			_.append(new Option(Pe, Ve));
		}
		const ie = document.createElement("label");
		(ie.htmlFor = _.id), (ie.textContent = "What stood out?");
		const Ee = document.createElement("textarea");
		(Ee.id = "fp-feedback-note"),
			(Ee.maxLength = 280),
			(Ee.rows = 3),
			Ee.setAttribute("data-clarity-mask", "true"),
			Ee.setAttribute("autocomplete", "off");
		const Oe = document.createElement("label");
		(Oe.htmlFor = Ee.id),
			(Oe.textContent = "Anything else? (optional, 280 characters)");
		const Ye = L("p", "", "fp-footnote");
		Ye.setAttribute("role", "status");
		const je = xe("Send feedback", () => {}, "stampbtn fp-primary");
		je.type = "submit";
		const mt = xe(r ? "Back to score" : "Back to the ball", () =>
			r ? Ze() : pe()
		);
		w.append(I, ie, _, Oe, Ee, je, mt, Ye), C.append(w);
		let Te = null,
			gt = !1;
		w.addEventListener("submit", async (Ve) => {
			if ((Ve.preventDefault(), gt || !w.reportValidity())) {
				return;
			}
			if (!t.allowed()) {
				t.onExit();
				return;
			}
			const Pe = new FormData(w).get("again");
			(!Te ||
				Te.again !== Pe ||
				Te.reason !== _.value ||
				Te.note !== Ee.value) &&
				(Te = {
					again: Pe,
					id: crypto.randomUUID(),
					note: Ee.value,
					preset: i.preset,
					reason: _.value,
					throws: i.throws,
					visitId: O.visitId,
				}),
				(gt = !0),
				(je.disabled = !0),
				(Ye.textContent = "Sending…");
			const lt = t.preview ? !1 : await Bo(Te);
			if (!(M || !w.isConnected)) {
				if (((gt = !1), (je.disabled = !1), !lt)) {
					Ye.textContent = t.preview
						? "This review keeps feedback on this device. Nothing was sent."
						: "Could not send. Your note is still here. Try again.";
					return;
				}
				(h.feedbackAt = Date.now()),
					ze(),
					O.emit("feedback", {
						action: "sent",
						again: Te.again,
						reason: Te.reason || "none",
					}),
					w.replaceChildren(
						L(
							"p",
							"Thanks. This helps us decide what to build next.",
							"fp-copy"
						),
						mt
					),
					mt.focus({ preventScroll: !0 });
			}
		});
	}
	function Ce(r, w = !1) {
		for (const I of r) {
			if (
				(I.type === "decided" &&
					(O.decided(i, I.result.outcome, I.result.made),
					I.result.made
						? (w || s.binIn(),
							F || ((F = h.taught = !0), ze()),
							(V.textContent = `${i.bins} in the bin. ${i.ballsLeft} balls left.`))
						: !(F || w) && qe(Ke(I.result))),
				I.type === "settled" && !w && i.phase !== "finished" && s.paperTear(),
				I.type === "finished")
			) {
				const _ = Do(h, i);
				ze(), O.finish(i, _), w || Ze(_);
			}
		}
		Ue();
	}
	function Ke(r) {
		var w;
		return r.outcome === "short"
			? "A little longer on the swipe."
			: r.outcome === "over"
				? "A shorter swipe. That went too far."
				: r.outcome === "wide"
					? (((w = r.atBin) == null ? void 0 : w.dx) || 0) > 0
						? "Aim a little more to the left."
						: "Aim a little more to the right."
					: r.outcome === "rim"
						? "So close. Try that flick again."
						: "Swipe up towards the bin.";
	}
	function at(r, w) {
		if (M || P || z || f) {
			return;
		}
		if (!t.allowed()) {
			t.onExit();
			return;
		}
		const I = i.release(r);
		I &&
			(O.released(i, w),
			s.unlock(),
			s.paperCrumple(),
			Y.throwBall(I, {
				onContact: (_, ie) => {
					M ||
						P ||
						(_ === "rim"
							? s.binRim(ie)
							: ["wall", "table", "desk"].includes(_)
								? s.paperHit(_, ie)
								: _ !== "bin" && s.paperHit("floor", ie));
				},
			}),
			Y.endPull(),
			(u = !0),
			Ue());
	}
	function Xe(r) {
		const w = new re(r.x, r.y, r.z).project(ve);
		return { x: ((w.x + 1) * U) / 2, y: ((1 - w.y) * J) / 2 };
	}
	function it(r, w) {
		he(), (U = r), (J = w), Io(ve, _e, et, r, w);
		const I = Xe({ x: -1.25, y: 1.23, z: 0.03 });
		oe.style.top = `${Math.max(62, I.y + 10)}px`;
		const _ = Xe({ x: -1.25, y: 2.32, z: 0.03 });
		(se.style.top = `${Math.max(62, _.y - 104)}px`), (u = !0);
	}
	const Re = (r, w, I) => r.addEventListener(w, I, { signal: Ae.signal });
	Re(X.querySelector("[data-fp=exit]"), "click", t.onExit),
		Re(X.querySelector("[data-fp=menu]"), "click", st),
		Re(X.querySelector(".fp-skip"), "click", () => {
			(F = h.taught = !0), ze(), Ue(), j.focus({ preventScroll: !0 });
		}),
		Re(j, "pointerdown", (r) => {
			if (r.button !== 0 || G || f || P || !i.canThrow) {
				return;
			}
			if (!t.allowed()) {
				t.onExit();
				return;
			}
			const w = Xe(xt(_e, et));
			if (
				Math.hypot(r.clientX - w.x, r.clientY - w.y) > Math.max(80, U * 0.12)
			) {
				F || qe("Start on the paper ball.");
				return;
			}
			r.preventDefault(),
				s.unlock(),
				O.interaction(),
				j.focus({ preventScroll: !0 }),
				(G = {
					budget: sn(J),
					id: r.pointerId,
					kind: r.pointerType,
					x: r.clientX,
					y: r.clientY,
				});
			try {
				j.setPointerCapture(r.pointerId);
			} catch {}
		}),
		Re(j, "pointermove", (r) => {
			!G ||
				r.pointerId !== G.id ||
				(r.preventDefault(),
				Y.setPull(
					_e,
					Math.max(
						0,
						(Math.hypot(r.clientX - G.x, r.clientY - G.y) - nt) /
							(G.budget - nt)
					)
				),
				(u = !0));
		}),
		Re(j, "pointerup", (r) => {
			if (!G || r.pointerId !== G.id) {
				return;
			}
			r.preventDefault();
			const w = G;
			he();
			const I = an(
				{ budget: w.budget, dx: r.clientX - w.x, dy: r.clientY - w.y },
				_e,
				et
			);
			I ? at(I, w.kind) : F || qe("Swipe upwards before you let go.");
		}),
		Re(j, "pointercancel", he),
		Re(j, "lostpointercapture", (r) => {
			(G == null ? void 0 : G.id) === r.pointerId && he();
		}),
		Re(X, "contextmenu", (r) => r.preventDefault()),
		Re(X, "keydown", (r) => {
			if ((r.stopPropagation(), r.key === "Escape")) {
				r.preventDefault(),
					f === "result"
						? t.onExit()
						: f
							? i.phase === "finished"
								? Ze()
								: pe()
							: st();
				return;
			}
			if (f && r.key === "Tab") {
				const w = [
						...C.querySelectorAll(
							"button:not([disabled]), input, select, textarea"
						),
					].filter((ie) => !ie.hidden),
					I = w[0],
					_ = w.at(-1);
				r.shiftKey &&
				(document.activeElement === I || document.activeElement === C)
					? (r.preventDefault(), _ == null || _.focus())
					: !r.shiftKey &&
						document.activeElement === _ &&
						(r.preventDefault(), I == null || I.focus());
				return;
			}
			f ||
				r.target !== j ||
				!i.canThrow ||
				(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
					r.key
				) &&
					(r.preventDefault(),
					O.interaction(),
					r.key === "ArrowUp" && (le = Math.min(1, le + 0.02)),
					r.key === "ArrowDown" && (le = Math.max(0.02, le - 0.02)),
					r.key === "ArrowLeft" && (ye = Math.max(-50, ye - 2)),
					r.key === "ArrowRight" && (ye = Math.min(50, ye + 2)),
					r.key === " " && !r.repeat
						? rt(le, ye, "keyboard")
						: (Y.setPull(_e, le),
							(u = !0),
							(V.textContent = `Length ${Math.round(le * 100)} percent. Aim ${ye} degrees.`))));
		});
	function rt(r, w = 0, I = "review") {
		const _ = sn(J),
			ie = nt + r * (_ - nt),
			Ee = (w * Math.PI) / 180,
			Oe = an(
				{ budget: _, dx: Math.sin(Ee) * ie, dy: -Math.cos(Ee) * ie },
				_e,
				et
			);
		Oe && at(Oe, I);
	}
	return (
		e.domElement.addEventListener(
			"webglcontextlost",
			(r) => {
				r.preventDefault(),
					(z = !0),
					he(),
					O.checkpoint(i),
					O.emit("error", { stage: "context_lost" }),
					(V.textContent = "The room is paused while the display recovers.");
			},
			{ signal: Ae.signal }
		),
		e.domElement.addEventListener(
			"webglcontextrestored",
			() => {
				(z = !1),
					(u = !0),
					(V.textContent = "The room is ready. Your round is still here.");
			},
			{ signal: Ae.signal }
		),
		qe(
			matchMedia("(pointer: coarse)").matches
				? "Swipe up. Then let go."
				: "Drag up. Then release."
		),
		De(),
		it(U, J),
		Ue(),
		j.focus({ preventScroll: !0 }),
		{
			diagnostics: () => ({
				ballsLeft: i.ballsLeft,
				best: h.best,
				bestStreak: i.bestStreak,
				bins: i.bins,
				calls: e.info.render.calls,
				canThrow: i.canThrow,
				contextLost: z,
				framing: {
					ball: Xe(xt(_e)),
					bin: Xe({ x: E.bin.x, y: E.bin.rimHeight, z: E.bin.z }),
				},
				memory: { ...e.info.memory },
				modal: f,
				nextPreset: a,
				phase: i.phase,
				pixelRatio: e.getPixelRatio(),
				preset: i.preset,
				roundId: i.id,
				saved: p,
				streak: i.streak,
				suspended: P,
				throws: i.throws,
			}),
			dispose(r = "corridor") {
				if (!M) {
					Ce(i.settleOnLeave(), !0),
						O.exit(i, r),
						(M = !0),
						he(),
						Ae.abort(),
						Y.dispose(),
						ce.dispose(),
						X.remove();
					for (const { el: w, inert: I } of ke) {
						w.isConnected && (w.inert = I);
					}
					document.body.classList.remove("free-period-active"),
						Se === null
							? e.domElement.removeAttribute("aria-label")
							: e.domElement.setAttribute("aria-label", Se),
						e.setPixelRatio(Q);
				}
			},
			pause() {
				(P = !0), he(), O.checkpoint(i);
			},
			previewThrow(r, w) {
				t.preview && rt(r, w);
			},
			render() {
				if (M || z) {
					return !1;
				}
				const r = ne.sample({
					canResize: i.canThrow && !G && !f,
					ceiling: _o(U, J, devicePixelRatio),
					focused: !(f || P || document.hidden),
					now: performance.now(),
					ratio: e.getPixelRatio(),
					rendered: W,
				});
				return (
					r !== null && (e.setPixelRatio(r), (u = !0)),
					(W = u || (!(f || P) && Y.animated)),
					W &&
						(e.render(Y.scene, ve),
						(u = !1),
						n ||
							((n = !0),
							O.emit("ready", {
								load_ms: Math.round(t.loadMs + performance.now() - c),
							}))),
					W
				);
			},
			resize: it,
			resume() {
				(P = !1), (u = !0);
			},
			update(r) {
				if (M) {
					return;
				}
				const w = P || z || !!f || document.hidden;
				O.tick(r, w), !w && (Ce(i.advance(r)), Y.tick(r, performance.now()));
			},
		}
	);
}
export { jo as createFreePeriod, Yo as preloadFreePeriodBags };
