# ソフトウェアアーキテクチャ実装集

このリポジトリは、さまざまなソフトウェアアーキテクチャパターンの実装例を集めたモノレポです。各アーキテクチャは独自のディレクトリに実装されており、共通の開発環境と依存関係管理を行っています。

## 実装済みアーキテクチャ

- [マイクロカーネルアーキテクチャ](./architectures/microkernel/README.md)
  - 最小限のコア（カーネル）と拡張機能（プラグイン）で構成されるアーキテクチャ
  - 決済処理SDKとプラグインの実装例

- [イベント駆動アーキテクチャ](./architectures/event-driven/README.md) (実装予定)
  - イベントの生成、検出、消費を通じてコンポーネント間で通信するアーキテクチャ
  - イベントストリーミング、CQRS、イベントソーシングの実装例

## 今後追加予定のアーキテクチャ

- **レイヤードアーキテクチャ**
- **クリーンアーキテクチャ**
- **ヘキサゴナルアーキテクチャ**
- **サービス指向アーキテクチャ (SOA)**
- **マイクロサービスアーキテクチャ**

## ディレクトリ構造

```
architectures/
├── microkernel/               # マイクロカーネルアーキテクチャ
│   ├── packages/              # 実装パッケージ
│   │   ├── sdk/               # SDK実装
│   │   └── plugins/           # プラグイン実装
│   │       └── 3rd-party/     # サードパーティプラグイン
│   └── demos/                 # デモアプリケーション
├── event-driven/              # イベント駆動アーキテクチャ
│   ├── packages/              # 実装パッケージ
│   └── demos/                 # デモアプリケーション
└── [future architectures]/    # 将来追加するアーキテクチャ
```

## 技術スタック

- **言語**: TypeScript
- **ビルドツール**: turborepo
- **パッケージマネージャ**: pnpm
- **リンター/フォーマッター**: Biome

## 開発方法

### 前提条件

- Node.js v18以上
- pnpm v9以上

### セットアップ

```bash
# リポジトリのクローン
git clone <リポジトリURL>
cd software-architecture-examples

# 依存関係のインストール
pnpm install
```

### 開発サーバーの起動

```bash
# すべてのサービスを起動
pnpm dev

# 特定のアーキテクチャのみ起動
pnpm --filter @arch/microkernel-* dev
pnpm --filter @arch/event-driven-* dev
```

### ビルド

```bash
# すべてのパッケージをビルド
pnpm build

# 特定のアーキテクチャのみビルド
pnpm --filter @arch/microkernel-* build
```

## 学習リソース

各アーキテクチャパターンの詳細については、以下のリソースを参照してください：

- [マーティン・ファウラーのソフトウェアアーキテクチャガイド](https://martinfowler.com/architecture/)
- [マイクロサービスパターン](https://microservices.io/patterns/index.html)
- [エンタープライズ統合パターン](https://www.enterpriseintegrationpatterns.com/)

## ライセンス

ISC 