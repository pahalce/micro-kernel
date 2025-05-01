# micro-kernel-amazon-pay

micro-kernel-pay用のAmazon Pay決済プラグインです。
マイクロカーネルアーキテクチャに基づいた外部プラグインパッケージの実装例です。

## 特徴

- micro-kernel-payシステム用のAmazon Pay決済機能を提供
- 外部プラグインパッケージとして実装
- シンプルなAPI

## インストール

```bash
npm install micro-kernel-pay micro-kernel-amazon-pay
```

## 使い方

```typescript
import { Kernel } from "micro-kernel-pay";
import amazonPayPlugin from "micro-kernel-amazon-pay";
import type { PaymentRequest } from "micro-kernel-pay/dist/src/types.js";

// カーネル初期化時にプラグインを渡す
const kernel = new Kernel({
  plugins: [amazonPayPlugin]
});

// Amazon Payで決済
const request: PaymentRequest = {
  gateway: "amazon-pay", // ゲートウェイ名を指定
  amount: 5000,
  currency: "JPY",
  customerId: "cust_123456"
};

const result = await kernel.pay(request);
console.log(result);
```

## Web APIでの使用例

Honoを使用したWeb API実装例：

```typescript
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Kernel } from "micro-kernel-pay";
import amazonPayPlugin from "micro-kernel-amazon-pay";
import type { PaymentRequest } from "micro-kernel-pay/dist/src/types.js";

// カーネル初期化とプラグイン登録
const kernel = new Kernel({
  plugins: [amazonPayPlugin]
});

// ローカルプラグインもロード (例: Stripe, PayPal)
await kernel.loadLocalPlugins();

// Honoアプリ
const app = new Hono();

app.post("/pay", async (c) => {
  const req = await c.req.json<PaymentRequest>();
  const result = await kernel.pay(req);
  return c.json(result, result.ok ? 200 : 400);
});

// HTTPサーバー起動
serve({ port: 3000, fetch: app.fetch });
```

## ゲートウェイの直接利用

プラグイン関数ではなく、ゲートウェイオブジェクトを直接利用することもできます：

```typescript
import { amazonPayPlugin } from "micro-kernel-amazon-pay";
import type { PaymentRequest } from "micro-kernel-pay/dist/src/types.js";

// ゲートウェイ直接利用
const request: PaymentRequest = {
  gateway: "amazon-pay",
  amount: 5000,
  currency: "JPY",
  customerId: "cust_123456"
};

const result = await amazonPayPlugin.charge(request);
console.log(result);
``` 