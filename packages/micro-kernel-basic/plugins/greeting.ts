import type { KernelAPI } from "../src/kernel.ts";

export default (api: KernelAPI) => {
	api.registerCommand("greet", (name = "world") => `Hello, ${name}!`);
};
