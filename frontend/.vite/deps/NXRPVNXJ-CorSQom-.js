import { O as getPreferredColorScheme, m as createComponent, v as createMemo } from "./Q7GRFEEB-BO3uqhVF.js";
import { a as QueryDevtoolsContext, c as createLocalStorage, i as PiPProvider, n as Devtools, s as ThemeContext } from "./QIR4F55C-CPBJusQX.js";
//#region node_modules/.pnpm/@tanstack+query-devtools@5.99.0/node_modules/@tanstack/query-devtools/build/DevtoolsComponent/NXRPVNXJ.js
var DevtoolsComponent = (props) => {
	const [localStore, setLocalStore] = createLocalStorage({ prefix: "TanstackQueryDevtools" });
	const colorScheme = getPreferredColorScheme();
	const theme = createMemo(() => {
		const preference = props.theme || localStore.theme_preference || "system";
		if (preference !== "system") return preference;
		return colorScheme();
	});
	return createComponent(QueryDevtoolsContext.Provider, {
		value: props,
		get children() {
			return createComponent(PiPProvider, {
				localStore,
				setLocalStore,
				get children() {
					return createComponent(ThemeContext.Provider, {
						value: theme,
						get children() {
							return createComponent(Devtools, {
								localStore,
								setLocalStore
							});
						}
					});
				}
			});
		}
	});
};
var DevtoolsComponent_default = DevtoolsComponent;
//#endregion
export { DevtoolsComponent_default as default };

//# sourceMappingURL=NXRPVNXJ-CorSQom-.js.map