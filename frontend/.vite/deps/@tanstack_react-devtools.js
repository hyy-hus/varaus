"use client";
"use client";
import { i as __toESM, t as require_react } from "./react-DOFghJpM.js";
import { t as require_jsx_runtime } from "./jsx-runtime-DtJKVGpA.js";
import { t as require_react_dom } from "./react-dom-BD-Djt9-.js";
import { t as initialState } from "./BNGI36V3-D1hKll0x.js";
//#region node_modules/.pnpm/@tanstack+devtools@0.11.2_csstype@3.2.3_solid-js@1.9.12/node_modules/@tanstack/devtools/dist/dev.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var TanStackDevtoolsCore = class {
	#config = { ...initialState.settings };
	#plugins = [];
	#state = "unmounted";
	#mountAbortController;
	#dispose;
	#eventBus;
	#eventBusConfig;
	#setPlugins;
	constructor(init) {
		this.#plugins = init.plugins || [];
		this.#eventBusConfig = init.eventBusConfig;
		this.#config = {
			...this.#config,
			...init.config
		};
	}
	mount(el) {
		if (typeof document === "undefined") return;
		if (this.#state === "mounted" || this.#state === "mounting") throw new Error("Devtools is already mounted");
		this.#state = "mounting";
		const { signal } = this.#mountAbortController = new AbortController();
		import("./3OW54XWT-CP08WgSk.js").then(({ mountDevtools }) => {
			if (signal.aborted) return;
			const result = mountDevtools({
				el,
				plugins: this.#plugins,
				config: this.#config,
				eventBusConfig: this.#eventBusConfig,
				onSetPlugins: (setPlugins) => {
					this.#setPlugins = setPlugins;
				}
			});
			this.#dispose = result.dispose;
			this.#eventBus = result.eventBus;
			this.#state = "mounted";
		}).catch((err) => {
			this.#state = "unmounted";
			console.error("[TanStack Devtools] Failed to load:", err);
		});
	}
	unmount() {
		if (this.#state === "unmounted") throw new Error("Devtools is not mounted");
		this.#mountAbortController?.abort();
		this.#eventBus?.stop();
		this.#dispose?.();
		this.#state = "unmounted";
	}
	setConfig(config) {
		this.#config = {
			...this.#config,
			...config
		};
		if (config.plugins) {
			this.#plugins = config.plugins;
			if (this.#state === "mounted" && this.#setPlugins) this.#setPlugins(config.plugins);
		}
	}
};
//#endregion
//#region node_modules/.pnpm/@tanstack+react-devtools@0.10.2_@types+react-dom@19.2.3_@types+react@19.2.14__@types+re_b2ce85d5888b81898e5d07dc69dc768f/node_modules/@tanstack/react-devtools/dist/esm/devtools.js
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var import_jsx_runtime = require_jsx_runtime();
var convertRender = (Component, setComponents, e, props) => {
	const element = typeof Component === "function" ? Component(e, props) : Component;
	setComponents((prev) => ({
		...prev,
		[e.getAttribute("id")]: element
	}));
};
var convertTrigger = (Component, setComponent, e, props) => {
	setComponent(typeof Component === "function" ? Component(e, props) : Component);
};
var TanStackDevtools$1 = ({ plugins, config, eventBusConfig }) => {
	const devToolRef = (0, import_react.useRef)(null);
	const [pluginContainers, setPluginContainers] = (0, import_react.useState)({});
	const [titleContainers, setTitleContainers] = (0, import_react.useState)({});
	const [triggerContainer, setTriggerContainer] = (0, import_react.useState)(null);
	const [PluginComponents, setPluginComponents] = (0, import_react.useState)({});
	const [TitleComponents, setTitleComponents] = (0, import_react.useState)({});
	const [TriggerComponent, setTriggerComponent] = (0, import_react.useState)(null);
	const pluginsMap = (0, import_react.useMemo)(() => plugins?.map((plugin) => {
		return {
			...plugin,
			name: typeof plugin.name === "string" ? plugin.name : (e, props) => {
				const id = e.getAttribute("id");
				if (e.ownerDocument.getElementById(id)) setTitleContainers((prev) => ({
					...prev,
					[id]: e
				}));
				convertRender(plugin.name, setTitleComponents, e, props);
			},
			render: (e, theme) => {
				const id = e.getAttribute("id");
				if (e.ownerDocument.getElementById(id)) setPluginContainers((prev) => ({
					...prev,
					[id]: e
				}));
				convertRender(plugin.render, setPluginComponents, e, theme);
			}
		};
	}) ?? [], [plugins]);
	const [devtools] = (0, import_react.useState)(() => {
		const { customTrigger, ...coreConfig } = config || {};
		return new TanStackDevtoolsCore({
			config: {
				...coreConfig,
				customTrigger: customTrigger ? (el, props) => {
					setTriggerContainer(el);
					convertTrigger(customTrigger, setTriggerComponent, el, props);
				} : void 0
			},
			eventBusConfig,
			plugins: pluginsMap
		});
	});
	(0, import_react.useEffect)(() => {
		devtools.setConfig({ plugins: pluginsMap });
	}, [devtools, pluginsMap]);
	(0, import_react.useEffect)(() => {
		if (devToolRef.current) devtools.mount(devToolRef.current);
		return () => devtools.unmount();
	}, [devtools]);
	const hasPlugins = Object.values(pluginContainers).length > 0 && Object.values(PluginComponents).length > 0;
	const hasTitles = Object.values(titleContainers).length > 0 && Object.values(TitleComponents).length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: { position: "absolute" },
			ref: devToolRef
		}),
		hasPlugins ? Object.entries(pluginContainers).map(([key, pluginContainer]) => (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: PluginComponents[key] }), pluginContainer)) : null,
		hasTitles ? Object.entries(titleContainers).map(([key, titleContainer]) => (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: TitleComponents[key] }), titleContainer)) : null,
		triggerContainer && TriggerComponent ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: TriggerComponent }), triggerContainer) : null
	] });
};
//#endregion
//#region node_modules/.pnpm/@tanstack+react-devtools@0.10.2_@types+react-dom@19.2.3_@types+react@19.2.14__@types+re_b2ce85d5888b81898e5d07dc69dc768f/node_modules/@tanstack/react-devtools/dist/esm/index.js
var TanStackDevtools = TanStackDevtools$1;
//#endregion
export { TanStackDevtools };

//# sourceMappingURL=@tanstack_react-devtools.js.map