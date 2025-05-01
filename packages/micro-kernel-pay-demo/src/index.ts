/* ------------------------------------------------------------------
   Demo application – 3rd party plugin を使った Payment Hub の実装例
------------------------------------------------------------------- */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Kernel } from "micro-kernel-pay/dist/src/kernel.js";
import amazonPayPlugin from "micro-kernel-amazon-pay";
import type { PaymentRequest } from "micro-kernel-pay/dist/src/types.js";

/* --- カーネル起動 & プラグインロード --- */
// 外部プラグインをKernelに渡す方法
const kernel = new Kernel({
  plugins: [amazonPayPlugin], // Amazon Pay プラグインを渡す
});

// ローカルプラグインが必要ない場合は、この行をコメントアウトかtry-catchで囲みます
await kernel.loadLocalPlugins();

/* --- Hono アプリ定義 --- */
const app = new Hono();

app.get("/", (c) => {
  return c.text(`
    Payment Hub Demo
    Available gateways: amazon-pay
    
    curl -X POST http://localhost:3002/pay \\
      -H "Content-Type: application/json" \\
      -d '{
        "gateway": "amazon-pay",
        "amount": 5000,
        "currency": "JPY",
        "customerId": "cust_123456"
      }'
  `);
});

app.post("/pay", async (c) => {
  const req = await c.req.json<PaymentRequest>();
  const result = await kernel.pay(req);
  return c.json(result, result.ok ? 200 : 400);
});

/* --- HTTP サーバ起動 --- */
// デモアプリは3002ポートで起動
const PORT = 3002;
serve({ port: PORT, fetch: app.fetch }, () =>
  kernel.logger.info(
    `🚀  Demo Payment Hub running at http://localhost:${PORT}`,
  ),
);
