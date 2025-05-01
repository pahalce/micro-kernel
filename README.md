# マイクロカーネルモノレポ

このリポジトリはマイクロカーネルアーキテクチャパターンを採用したモノレポです。複数のサービスがそれぞれマイクロカーネルパターンで実装されており、共通の開発環境と依存関係管理を行っています。

## 構成

このモノレポは以下のパッケージで構成されています：

- **SDK**
  - **@micro-kernel/pay-sdk**: 決済処理のマイクロカーネルSDK実装
- **プラグイン**
  - **3rd-party**
    - **@micro-kernel/amazon-pay-plugin**: Amazon Pay用プラグイン
- **デモアプリケーション**
  - **@micro-kernel/pay-demo**: 決済処理のデモアプリケーション（ポート3002）

## 技術スタック

- **言語**: TypeScript
- **ビルドツール**: turborepo
- **パッケージマネージャ**: pnpm
- **リンター/フォーマッター**: Biome
- **Webフレームワーク**: Hono

## 開発方法

### 前提条件

- Node.js v18以上
- pnpm v9以上

### セットアップ

```bash
# リポジトリのクローン
git clone <リポジトリURL>
cd micro-kernel

# 依存関係のインストール
pnpm install
```

### 開発サーバーの起動

```bash
# すべてのサービスを起動
pnpm dev

# 特定のサービスのみ起動
pnpm --filter @micro-kernel/pay-demo dev
```

### ビルド

```bash
# すべてのパッケージをビルド
pnpm build

# 特定のパッケージのみビルド
pnpm --filter @micro-kernel/pay-sdk build
```

### リンター・フォーマッター

```bash
# すべてのパッケージでリントを実行
pnpm lint

# コードフォーマット
pnpm format
```

## アーキテクチャ

このプロジェクトはマイクロカーネルアーキテクチャパターンを採用しています。各サービスは以下の構成要素から成ります：

1. **カーネル**: コアとなる機能を提供し、プラグイン管理を行う
2. **プラグイン**: 拡張機能を提供する
3. **API層**: クライアントとカーネルの間のインターフェース (Hono)

## コード例

### カーネルとプラグインの利用例

```typescript
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Kernel, type PaymentRequest } from "@micro-kernel/pay-sdk";
import amazonPayPlugin from "@micro-kernel/amazon-pay-plugin";
import { paypalPlugin, stripePlugin } from "@micro-kernel/pay-sdk/plugins";

// カーネル初期化とプラグインのロード
const kernel = new Kernel({
  plugins: [
    // SDK標準プラグイン
    paypalPlugin, 
    stripePlugin,
    // 外部プラグイン  
    amazonPayPlugin,
  ],
});

// API層の実装 (Hono)
const app = new Hono();

app.post("/pay", async (c) => {
  const req = await c.req.json<PaymentRequest>();
  const result = await kernel.pay(req);
  return c.json(result, result.ok ? 200 : 400);
});

// サーバー起動
const PORT = 3002;
serve({ port: PORT, fetch: app.fetch });
```

### カスタムプラグインの実装例

```typescript
import type {
  Kernel,
  PaymentGateway,
  PaymentRequest,
} from "@micro-kernel/pay-sdk";

// プラグインの実装
const amazonPayPlugin: PaymentGateway = {
  name: "amazon-pay",
  currencies: ["USD", "JPY", "EUR"],
  async charge(req: PaymentRequest) {
    try {
      // 決済処理の実装
      const id = await fakeAmazonPayCharge(req);
      return { ok: true, txId: id };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// プラグインローダー関数（カーネルに登録するための関数）
export default function amazonPayPluginLoader(api: Kernel) {
  api.registerGateway(amazonPayPlugin);
  api.logger.info("Amazon Pay plugin registered");
}
```

## エンドポイント

### @micro-kernel/pay-demo (ポート3002)

- `POST /pay`: 決済リクエストを処理する

## サンプルcurlコマンド

### @micro-kernel/pay-demo

**Stripe決済**:
```bash
curl -X POST http://localhost:3002/pay \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "stripe",
    "amount": 5000,
    "currency": "JPY",
    "customerId": "cust_123456"
  }'
```

**PayPal決済**:
```bash
curl -X POST http://localhost:3002/pay \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "paypal",
    "amount": 5000,
    "currency": "USD",
    "customerId": "cust_123456"
  }'
```

**Amazon Pay決済**:
```bash
curl -X POST http://localhost:3002/pay \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "amazon-pay",
    "amount": 5000,
    "currency": "JPY",
    "customerId": "cust_123456"
  }'
```

## ライセンス

ISC 