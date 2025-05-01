# micro-kernel-pay

マイクロカーネルアーキテクチャパターンを使用した決済処理の実装例です。

## 機能

- 複数の決済プロバイダー（Stripe, PayPal）のサポート
- プラグイン形式による決済プロバイダーの追加・削除
- REST APIによる決済リクエスト処理

## 利用可能なエンドポイント

- `POST /pay`: 決済リクエストを処理します
  ```json
  {
    "gateway": "stripe", // または "paypal"
    "amount": 5000,
    "currency": "JPY",
    "customerId": "cust_123"
  }
  ```

## サンプルcurlコマンド

**Stripeでの決済**:
```bash
curl -X POST http://localhost:3001/pay \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "stripe",
    "amount": 5000,
    "currency": "JPY",
    "customerId": "cust_123456"
  }'
```

**PayPalでの決済**:
```bash
curl -X POST http://localhost:3001/pay \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "paypal",
    "amount": 5000,
    "currency": "USD",
    "customerId": "cust_123456"
  }'
```

**成功レスポンス例**:
```json
{
  "ok": true,
  "txId": "tx_123456789"
}
```

**失敗レスポンス例**:
```json
{
  "ok": false,
  "error": "invalid_gateway"
}
```

## 開発

```bash
# 開発サーバー起動（ポート3001で稼働）
pnpm dev

# ビルド
pnpm build

# リンター
pnpm lint

# フォーマッター
pnpm format
```

## アーキテクチャ

- `src/kernel.ts`: カーネル実装
- `src/plugins/`: 決済プロバイダープラグイン実装
- `src/types.ts`: 型定義
- `src/index.ts`: APIエンドポイント定義と実行エントリーポイント 