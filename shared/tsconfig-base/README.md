# 共有TSConfig設定

このパッケージは、プロジェクト間で共有するためのTypeScript設定を提供します。

## インストール

```bash
npm install @shared/tsconfig-base --save-dev
# または
yarn add -D @shared/tsconfig-base
# または
pnpm add -D @shared/tsconfig-base
```

## 使用方法

以下のいずれかの設定を使用することができます：

### 基本設定

```json
{
  "extends": "@shared/tsconfig-base/tsconfig.json",
  "compilerOptions": {
    // プロジェクト固有の設定をオーバーライド
  },
  "include": ["src/**/*"]
}
```

### React用設定

```json
{
  "extends": "@shared/tsconfig-base/tsconfig.react.json",
  "compilerOptions": {
    // プロジェクト固有の設定をオーバーライド
  },
  "include": ["src/**/*"]
}
```

### Node.js用設定

```json
{
  "extends": "@shared/tsconfig-base/tsconfig.node.json",
  "compilerOptions": {
    // プロジェクト固有の設定をオーバーライド
  },
  "include": ["src/**/*"]
}
```

### ライブラリ用設定

```json
{
  "extends": "@shared/tsconfig-base/tsconfig.lib.json",
  "compilerOptions": {
    // プロジェクト固有の設定をオーバーライド
  },
  "include": ["src/**/*"]
}
```

## 設定の詳細

各設定ファイルの詳細：

- `tsconfig.json`: 基本設定、他のすべての設定の基盤
- `tsconfig.react.json`: React用の追加設定（JSX等）
- `tsconfig.node.json`: Node.js用の追加設定
- `tsconfig.lib.json`: ライブラリ開発用の設定 