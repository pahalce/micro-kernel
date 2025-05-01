import type { KernelAPI } from "../src/kernel.ts";

export default (api: KernelAPI) => {
	api.bus.subscribe<{ id: number }>("order.created", (o) =>
		api.logger.info(`[order] received: ${o.id}`),
	);
};
