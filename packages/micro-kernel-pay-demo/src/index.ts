/* ------------------------------------------------------------------
   Demo application – 3rd party plugin を使った Payment Hub の実装例
------------------------------------------------------------------- */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Kernel, type PaymentRequest } from "micro-kernel-pay-sdk";
import amazonPayPlugin from "micro-kernel-amazon-pay";
import { paypalPlugin, stripePlugin } from "micro-kernel-pay-sdk/plugins";

/* --- カーネル起動 & プラグインロード --- */
// 複数のプラグインを渡す方法
const kernel = new Kernel({
  plugins: [
    // SDK標準プラグイン
    paypalPlugin,
    stripePlugin,
    // 外部プラグイン
    amazonPayPlugin,
  ],
});

/* --- Hono アプリ定義 --- */
const app = new Hono();

app.get("/", (c) => {
  return c.text(`
    Payment Hub Demo
    Available gateways: stripe, paypal, amazon-pay
    
    Stripe決済:
    curl -X POST http://localhost:3002/pay \\
      -H "Content-Type: application/json" \\
      -d '{
        "gateway": "stripe",
        "amount": 5000,
        "currency": "JPY",
        "customerId": "cust_123456"
      }'
      
    PayPal決済:
    curl -X POST http://localhost:3002/pay \\
      -H "Content-Type: application/json" \\
      -d '{
        "gateway": "paypal",
        "amount": 5000,
        "currency": "USD",
        "customerId": "cust_123456"
      }'
      
    Amazon Pay決済:
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
