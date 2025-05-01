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