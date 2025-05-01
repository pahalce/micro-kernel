/* ------------------------------------------------------------------
   Public HTTP layer – Hono 版 (Payment Hub)
------------------------------------------------------------------- */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Kernel } from "./kernel.js";
import type { PaymentRequest } from "./types.js";

/* --- カーネル起動 & プラグインロード (top-level await) --- */
const kernel = new Kernel();
await kernel.loadPlugins(); // Stripe & PayPal が登録される

/* --- Hono アプリ定義 --- */
const app = new Hono();

app.post("/pay", async (c) => {
	const req = await c.req.json<PaymentRequest>();
	const result = await kernel.pay(req);
	return c.json(result, result.ok ? 200 : 400);
});

/* --- HTTP サーバ起動 --- */
serve(app, ({ port }) =>
	kernel.logger.info(`🚀  Payment Hub running at http://localhost:${port}`),
);
