/* ------------------------------------------------------------------
   Public HTTP layer – Hono 版 (Payment Hub)
------------------------------------------------------------------- */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Kernel } from "./kernel.js";
import type { PaymentRequest } from "./types.js";

/* --- カーネル起動 & プラグインロード (top-level await) --- */
// 外部プラグインの配列を受け取れるように修正
// 初期化時に外部プラグインを渡す場合は以下のように実装:
// const kernel = new Kernel({ plugins: [externalPlugin1, externalPlugin2] });
const kernel = new Kernel();
// ローカルプラグインをロード
await kernel.loadLocalPlugins();

/* --- 外部からの利用のためにカーネルをエクスポート --- */
export { Kernel };

/* --- Hono アプリ定義 --- */
const app = new Hono();

app.post("/pay", async (c) => {
  const req = await c.req.json<PaymentRequest>();
  const result = await kernel.pay(req);
  return c.json(result, result.ok ? 200 : 400);
});

/* --- HTTP サーバ起動 --- */
// ポート番号を明示的に設定
const PORT = 3001;
serve({ port: PORT, fetch: app.fetch }, () =>
  kernel.logger.info(`🚀  Payment Hub running at http://localhost:${PORT}`),
);
