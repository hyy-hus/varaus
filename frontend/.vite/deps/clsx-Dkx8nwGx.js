//#region node_modules/.pnpm/goober@2.1.18_csstype@3.2.3/node_modules/goober/dist/goober.modern.js
var e = { data: "" }, t = (t) => {
	if ("object" == typeof window) {
		let e = (t ? t.querySelector("#_goober") : window._goober) || Object.assign(document.createElement("style"), {
			innerHTML: " ",
			id: "_goober"
		});
		return e.nonce = window.__nonce__, e.parentNode || (t || document.head).appendChild(e), e.firstChild;
	}
	return t || e;
}, l = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g, a = /\/\*[^]*?\*\/|  +/g, n = /\n+/g, o = (e, t) => {
	let r = "", l = "", a = "";
	for (let n in e) {
		let c = e[n];
		"@" == n[0] ? "i" == n[1] ? r = n + " " + c + ";" : l += "f" == n[1] ? o(c, n) : n + "{" + o(c, "k" == n[1] ? "" : t) + "}" : "object" == typeof c ? l += o(c, t ? t.replace(/([^,])+/g, (e) => n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g, (t) => /&/.test(t) ? t.replace(/&/g, e) : e ? e + " " + t : t)) : n) : null != c && (n = /^--/.test(n) ? n : n.replace(/[A-Z]/g, "-$&").toLowerCase(), a += o.p ? o.p(n, c) : n + ":" + c + ";");
	}
	return r + (t && a ? t + "{" + a + "}" : a) + l;
}, c = {}, s = (e) => {
	if ("object" == typeof e) {
		let t = "";
		for (let r in e) t += r + s(e[r]);
		return t;
	}
	return e;
}, i = (e, t, r, i, p) => {
	let u = s(e), d = c[u] || (c[u] = ((e) => {
		let t = 0, r = 11;
		for (; t < e.length;) r = 101 * r + e.charCodeAt(t++) >>> 0;
		return "go" + r;
	})(u));
	if (!c[d]) {
		let t = u !== e ? e : ((e) => {
			let t, r, o = [{}];
			for (; t = l.exec(e.replace(a, ""));) t[4] ? o.shift() : t[3] ? (r = t[3].replace(n, " ").trim(), o.unshift(o[0][r] = o[0][r] || {})) : o[0][t[1]] = t[2].replace(n, " ").trim();
			return o[0];
		})(e);
		c[d] = o(p ? { ["@keyframes " + d]: t } : t, r ? "" : "." + d);
	}
	let f = r && c.g ? c.g : null;
	return r && (c.g = c[d]), ((e, t, r, l) => {
		l ? t.data = t.data.replace(l, e) : -1 === t.data.indexOf(e) && (t.data = r ? e + t.data : t.data + e);
	})(c[d], t, i, f), d;
}, p = (e, t, r) => e.reduce((e, l, a) => {
	let n = t[a];
	if (n && n.call) {
		let e = n(r), t = e && e.props && e.props.className || /^go/.test(e) && e;
		n = t ? "." + t : e && "object" == typeof e ? e.props ? "" : o(e, "") : !1 === e ? "" : e;
	}
	return e + l + (null == n ? "" : n);
}, "");
function u(e) {
	let r = this || {}, l = e.call ? e(r.p) : e;
	return i(l.unshift ? l.raw ? p(l, [].slice.call(arguments, 1), r.p) : l.reduce((e, t) => Object.assign(e, t && t.call ? t(r.p) : t), {}) : l, t(r.target), r.g, r.o, r.k);
}
u.bind({ g: 1 });
var h = u.bind({ k: 1 });
//#endregion
//#region node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
//#endregion
export { h as n, u as r, clsx as t };

//# sourceMappingURL=clsx-Dkx8nwGx.js.map