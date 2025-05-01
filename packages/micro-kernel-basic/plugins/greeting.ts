import type { KernelAPI } from "../src/kernel.ts";

export default (api: KernelAPI) => {
  api.registerCommand("greet", (name = "world") => {
    api.logger.info(`[greeting] received: ${name}`);
    return `Hello, ${name}!`;
  });
};
