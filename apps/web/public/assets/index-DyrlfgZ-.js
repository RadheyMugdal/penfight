(() => {
	const e = document.createElement("link").relList;
	if (e && e.supports && e.supports("modulepreload")) {
		return;
	}
	for (const n of document.querySelectorAll('link[rel="modulepreload"]')) {
		s(n);
	}
	new MutationObserver((n) => {
		for (const r of n) {
			if (r.type === "childList") {
				for (const c of r.addedNodes) {
					c.tagName === "LINK" && c.rel === "modulepreload" && s(c);
				}
			}
		}
	}).observe(document, { childList: !0, subtree: !0 });
	function o(n) {
		const r = {};
		return (
			n.integrity && (r.integrity = n.integrity),
			n.referrerPolicy && (r.referrerPolicy = n.referrerPolicy),
			n.crossOrigin === "use-credentials"
				? (r.credentials = "include")
				: n.crossOrigin === "anonymous"
					? (r.credentials = "omit")
					: (r.credentials = "same-origin"),
			r
		);
	}
	function s(n) {
		if (n.ep) {
			return;
		}
		n.ep = !0;
		const r = o(n);
		fetch(n.href, r);
	}
})();
const O = "modulepreload",
	S = (t) => "/" + t,
	w = {},
	k = (e, o, s) => {
		let n = Promise.resolve();
		if (o && o.length > 0) {
			const c = (l) =>
				Promise.all(
					l.map((d) =>
						Promise.resolve(d).then(
							(f) => ({ status: "fulfilled", value: f }),
							(f) => ({ reason: f, status: "rejected" })
						)
					)
				);
			document.getElementsByTagName("link");
			const i = document.querySelector("meta[property=csp-nonce]"),
				p =
					(i == null ? void 0 : i.nonce) ||
					(i == null ? void 0 : i.getAttribute("nonce"));
			n = c(
				o.map((l) => {
					if (((l = S(l)), l in w)) {
						return;
					}
					w[l] = !0;
					const d = l.endsWith(".css"),
						f = d ? '[rel="stylesheet"]' : "";
					if (document.querySelector(`link[href="${l}"]${f}`)) {
						return;
					}
					const u = document.createElement("link");
					if (
						((u.rel = d ? "stylesheet" : O),
						d || (u.as = "script"),
						(u.crossOrigin = ""),
						(u.href = l),
						p && u.setAttribute("nonce", p),
						document.head.appendChild(u),
						d)
					) {
						return new Promise((P, T) => {
							u.addEventListener("load", P),
								u.addEventListener("error", () =>
									T(new Error(`Unable to preload CSS for ${l}`))
								);
						});
					}
				})
			);
		}
		function r(c) {
			const i = new Event("vite:preloadError", { cancelable: !0 });
			if (((i.payload = c), window.dispatchEvent(i), !i.defaultPrevented)) {
				throw c;
			}
		}
		return n.then((c) => {
			for (const i of c || []) {
				i.status === "rejected" && r(i.reason);
			}
			return e().catch(r);
		});
	},
	D = 5,
	I = 8,
	y = "abcdefghjkmnpqrstuvwxyz23456789";
function V(t = 24) {
	const e = new Uint8Array(t);
	crypto.getRandomValues(e);
	let o = "";
	for (const s of e) {
		o += y[s % y.length];
	}
	return o;
}
function g(t) {
	if (!t) {
		return null;
	}
	const e = t
		.toLowerCase()
		.replace(/[^a-z2-9]/g, "")
		.slice(0, 32);
	return e.length >= 20 ? e : null;
}
function q(t, e, o) {
	const s = new URL(e, t);
	return (
		s.searchParams.set("duel", o), s.searchParams.set("r", "d"), s.toString()
	);
}
const A = {},
	b = A ?? {},
	C = b.VITE_DESK_PATH === "1" || b.VITE_DESK_PATH === "true";
function R(t) {
	if (!t) {
		return null;
	}
	const e = t.trim().toLowerCase();
	return e === "h" || e === "g" || /^w[a-hjkmnp-z2-9]{4}$/.test(e) ? e : null;
}
function $(t) {
	const e = new URLSearchParams(t.search),
		o = R(e.get("by")),
		s = t.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
	if (s[0] === "desk") {
		const r = g(s[1] ?? null);
		return r ? { by: o ?? "h", code: r } : null;
	}
	const n = o ? g(e.get("duel")) : null;
	return n && o ? { by: o, code: n } : null;
}
function H(t, e, o, s = C) {
	const n = new URL(s ? `/desk/${e}` : "/", t);
	return (
		s || n.searchParams.set("duel", e),
		n.searchParams.set("by", o),
		n.toString()
	);
}
const m = !!$(location);
let E = !1,
	a = null;
const U = () => {
		(E = !0),
			window.clearTimeout(v),
			window.clearTimeout(L),
			a == null || a.remove(),
			(a = null);
	},
	h = (t = "loading") => {
		var o;
		const e = t === "failed";
		(E && !e) ||
			(a ||
				((a = document.createElement("div")),
				(a.className = "chitwrap show pf-boot"),
				document.body.append(a)),
			(a.innerHTML = `<section class="chit schoolpaper" role="${e ? "alert" : "status"}" aria-label="${e ? "The desk could not open" : "Opening the desk"}">
    <h2>${e ? "The desk did not open." : m ? "Opening the desk." : t === "slow" ? "Still finding your seat." : "Finding your seat."}</h2>
    <p>${e ? (m ? "Check your connection and try again." : "Check your connection and try again. Your saved pens stay yours.") : t === "slow" ? "This connection is taking longer. You can wait or try again." : m ? "The match will be here in a moment." : "Your pens will be here in a moment."}</p>
    ${t === "loading" ? "" : '<button type="button" class="stampbtn">try again</button>'}</section>`),
			(o = a.querySelector("button")) == null ||
				o.addEventListener("click", () => location.reload()));
	},
	_ = () => {
		window.clearTimeout(v), window.clearTimeout(L), h("failed");
	};
window.addEventListener("pf:boot-ready", U, { once: !0 });
window.addEventListener("pf:boot-failed", _, { once: !0 });
const v = window.setTimeout(() => h(), 200),
	L = window.setTimeout(() => h("slow"), 25e3);
k(() => import("./main-NZF1ugMT.js?v=readyfix").then((t) => t.bZ), []).catch(_);
export {
	$ as d,
	D as P,
	g as c,
	H as b,
	I as D,
	k as _,
	q as a,
	R as e,
	V as n,
};
