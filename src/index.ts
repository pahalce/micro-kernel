/* ------------------------------------------------------------------
   Public HTTP layer – Hono 版
------------------------------------------------------------------- */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Kernel } from "./kernel.js";

/* --- カーネル起動 & プラグインロード  --- */
const kernel = new Kernel();
await kernel.loadPlugins();

/* --- Hono アプリ定義 --- */
const app = new Hono();

app.post("/greet", async (c) => {
	const { name } = await c.req.json<{ name?: string }>();
	const message = await kernel.exec("greet", name);
	return c.json({ message });
});

app.post("/order", async (c) => {
	const order = await c.req.json<unknown>();
	kernel.bus.publish("order.created", order);
	return c.json({ status: "accepted" }, 202);
});

/* --- HTTP サーバ起動 --- */
serve(app, ({ port }) =>
	kernel.logger.info(`🚀  Hono listening on http://localhost:${port}`),
);
