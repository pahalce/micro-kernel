# マイクロカーネルモノレポ

このリポジトリはマイクロカーネルアーキテクチャパターンを採用したモノレポです。複数のサービスがそれぞれマイクロカーネルパターンで実装されており、共通の開発環境と依存関係管理を行っています。

## 構成

このモノレポは以下のパッケージで構成されています：

- **micro-kernel-basic**: 基本的なマイクロカーネル実装例（ポート3000）
- **micro-kernel-pay**: 決済処理のマイクロカーネル実装例（ポート3001）

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
pnpm --filter micro-kernel-basic dev
pnpm --filter micro-kernel-pay dev
```

### ビルド

```bash
# すべてのパッケージをビルド
pnpm build

# 特定のパッケージのみビルド
pnpm --filter micro-kernel-basic build
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

## エンドポイント

### micro-kernel-basic (ポート3000)

- `POST /greet`: 挨拶メッセージを返す
- `POST /order`: 注文イベントを発行する

### micro-kernel-pay (ポート3001)

- `POST /pay`: 決済リクエストを処理する

## サンプルcurlコマンド

### micro-kernel-basic

**挨拶メッセージ取得**:
```bash
curl -X POST http://localhost:3000/greet \
  -H "Content-Type: application/json" \
  -d '{"name": "世界"}'
```

**注文イベント発行**:
```bash
curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "item1", "name": "商品A", "price": 1000, "quantity": 2},
      {"id": "item2", "name": "商品B", "price": 500, "quantity": 1}
    ],
    "customer": {
      "id": "cust123",
      "name": "山田太郎",
      "email": "yamada@example.com"
    }
  }'
```

### micro-kernel-pay

**決済処理**:
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

## ライセンス

ISC 