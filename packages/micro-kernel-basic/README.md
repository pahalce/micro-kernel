# micro-kernel-basic

マイクロカーネルアーキテクチャパターンを使用した基本的な実装例です。

## 機能

- プラグイン管理とカーネル機能の提供
- イベントバスを使用したメッセージング
- REST APIの提供

## 利用可能なエンドポイント

- `POST /greet`: 名前を送信すると挨拶メッセージを返します
  ```json
  { "name": "世界" }
  ```

- `POST /order`: 注文情報を受け取りイベントとして発行します
  ```json
  { "items": [...], "customer": { ... } }
  ```

## サンプルcurlコマンド

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

## 開発

```bash
# 開発サーバー起動（ポート3000で稼働）
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
- `src/plugins/`: プラグイン実装
- `src/index.ts`: APIエンドポイント定義と実行エントリーポイント 