# マイクロカーネルアーキテクチャ実装例

このディレクトリには、マイクロカーネルアーキテクチャのサンプル実装を含んでいます。マイクロカーネルアーキテクチャは、最小限のコア機能（カーネル）を持ち、プラグインを通じて機能を拡張できるアーキテクチャパターンです。

## 構成

このパッケージは以下のコンポーネントで構成されています：

- **SDK**
  - **@arch/microkernel-pay-sdk**: 決済処理のマイクロカーネルSDK実装
- **プラグイン**
  - **3rd-party**
    - **@arch/microkernel-amazon-pay-plugin**: Amazon Pay用プラグイン
- **デモアプリケーション**
  - **@arch/microkernel-pay-demo**: 決済処理のデモアプリケーション（ポート3002）

## 実装の特徴

- **カーネル**: コアとなる機能を提供し、プラグイン管理を行う
- **プラグイン**: 拡張機能を提供する
- **API層**: クライアントとカーネルの間のインターフェース (Hono)

## 使用技術

- **Webフレームワーク**: Hono
- **プラグイン管理**: カスタム実装
- **イベントバス**: カスタム実装

## 開発方法

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm --filter @arch/microkernel-* dev

# ビルド
pnpm --filter @arch/microkernel-* build
```

## エンドポイント

### @arch/microkernel-pay-demo (ポート3002)

- `POST /pay`: 決済リクエストを処理する

## サンプルcurlコマンド

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