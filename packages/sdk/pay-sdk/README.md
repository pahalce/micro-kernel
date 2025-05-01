# マイクロカーネル決済システム

このパッケージはマイクロカーネルアーキテクチャを採用した決済処理システムです。
コアシステムと外部からの拡張を分離し、新しい決済方法をプラグインとして柔軟に追加できます。

## 特徴

- マイクロカーネルアーキテクチャパターンの実装例
- プラグインによる拡張性
- コア機能とプラグインが明確に分離
- 3rd-partyのプラグインに対応

## インストール

```bash
npm install micro-kernel-pay
```

## 使い方

### 基本的な使用方法

```typescript
import { Kernel } from "micro-kernel-pay";
import type { PaymentRequest } from "micro-kernel-pay/dist/src/types.js";

// カーネルを初期化
const kernel = new Kernel();

// ローカルプラグインをロード
await kernel.loadLocalPlugins();

// 決済処理
const request: PaymentRequest = {
  gateway: "stripe", // or "paypal"
  amount: 5000,
  currency: "JPY",
  customerId: "cust_123456"
};

const result = await kernel.pay(request);
console.log(result);
```

### 外部プラグインを使用する

micro-kernel-payは3rd-partyのプラグインパッケージをサポートしています。
外部プラグインはカーネルの初期化時にオプションとして渡すことができます。

```typescript
import { Kernel } from "micro-kernel-pay";
import amazonPayPlugin from "micro-kernel-amazon-pay";
import type { PaymentRequest } from "micro-kernel-pay/dist/src/types.js";

// 外部プラグインを指定してカーネルを初期化
const kernel = new Kernel({
  plugins: [amazonPayPlugin]
});

// ローカルプラグインも一緒にロード
await kernel.loadLocalPlugins();

// Amazon Payで決済
const request: PaymentRequest = {
  gateway: "amazon-pay",
  amount: 5000,
  currency: "JPY",
  customerId: "cust_123456"
};

const result = await kernel.pay(request);
console.log(result);
```

## プラグイン開発

### ローカルプラグイン

ローカルプラグインは `plugins` ディレクトリに配置します。
以下のような形式でプラグインを作成します：

```typescript
// plugins/my-gateway.ts
import type { KernelAPI } from "../src/kernel.js";
import type { PaymentGateway, PaymentRequest, PaymentResult } from "../src/types.js";

const myGateway: PaymentGateway = {
  name: "my-gateway",
  currencies: ["USD", "JPY"],
  async charge(req: PaymentRequest): Promise<PaymentResult> {
    // 決済処理の実装
    return { ok: true, txId: "tx_123" };
  }
};

export default (api: KernelAPI) => {
  api.registerGateway(myGateway);
};
```

### 外部プラグインの開発

外部プラグインはnpmパッケージとして提供でき、以下のような構造を持ちます：

```typescript
// src/index.ts
import type { KernelAPI } from "micro-kernel-pay/dist/src/kernel.js";
import type { 
  PaymentGateway, 
  PaymentRequest, 
  PaymentResult 
} from "micro-kernel-pay/dist/src/types.js";

const myExternalGateway: PaymentGateway = {
  name: "my-external-gateway",
  currencies: ["USD", "JPY", "EUR"],
  async charge(req: PaymentRequest): Promise<PaymentResult> {
    // 決済処理の実装
    return { ok: true, txId: "tx_external_123" };
  }
};

// プラグイン関数をデフォルトエクスポート
export default function myExternalPlugin(api: KernelAPI) {
  api.registerGateway(myExternalGateway);
}

// オプションでプラグイン本体も直接エクスポート
export { myExternalGateway };
```

プラグインパッケージのpackage.jsonでは、micro-kernel-payを`peerDependencies`として指定する必要があります：

```json
{
  "name": "micro-kernel-my-gateway",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "micro-kernel-pay": "^1.0.0"
  }
}
```

## APIリファレンス

### Kernel

マイクロカーネルの中心となるクラス。

#### コンストラクタ

```typescript
constructor(options?: KernelOptions)
```

オプション:
- `plugins?: unknown[]` - 外部プラグインの配列
- `pluginsDir?: string` - ローカルプラグインのディレクトリパス (デフォルト: "./plugins")

#### メソッド

- `loadLocalPlugins(dir?: string): Promise<void>` - ローカルプラグインをロードする
- `pay(req: PaymentRequest): Promise<PaymentResult>` - 決済リクエストを処理する 