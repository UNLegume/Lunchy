---
title: 静的解析ルール設定（ESLint / OxLint）
status: not-started
priority: P0
depends_on: [03]
related_decisions: [D1, D2, D3, D15, D16, D17, D18]
completion_date:
---

# 04: 静的解析ルール設定（ESLint / OxLint）

## 概要

`docs/rules/coding-standards.md` に記載されたルールのうち、静的解析で強制できるものを ESLint / OxLint の設定に移行する。ドキュメントに頼らず、ツールが自動で検知・ブロックする状態にする。

## 移行対象ルール

| ルール                            | 移行先           | ESLint ルール                                               |
| --------------------------------- | ---------------- | ----------------------------------------------------------- |
| `any` 型禁止 (D16)                | ESLint           | `@typescript-eslint/no-explicit-any: error`                 |
| `console` 禁止 (D17)              | ESLint           | `no-console: error`                                         |
| 未使用 import / 変数 (D18)        | ESLint           | `@typescript-eslint/no-unused-vars: error`                  |
| クラスコンポーネント禁止 (D2)     | ESLint           | `react/prefer-stateless-function: error` など               |
| CSS Modules / CSS-in-JS 禁止 (D3) | OxLint or ESLint | `.css` / `.module.css` / styled-components の import を禁止 |
| `strict: true` (D1)               | tsconfig.json    | `"strict": true`                                            |

## pre-commit hook（OxLint + Prettier）

- husky + lint-staged で pre-commit hook を設定
- OxLint で高速チェック（上記ルールのうち OxLint 対応分）
- Prettier でフォーマット

## pre-push hook（ESLint + Prettier）

- husky で pre-push hook を設定
- ESLint で厳密チェック（全ルール）
- Prettier でフォーマット確認

## やること

- [ ] ESLint 設定ファイル作成（上記ルールを error で設定）
- [ ] OxLint 設定ファイル作成（pre-commit 用の高速チェックルール）
- [ ] Prettier 設定ファイル作成
- [ ] tsconfig.json に `strict: true` 設定
- [ ] husky 導入・初期設定
- [ ] lint-staged 設定（pre-commit: OxLint + Prettier）
- [ ] pre-push hook 設定（ESLint + Prettier）
- [ ] `docs/rules/coding-standards.md` から静的解析に移行済みのルールに「※ ESLint で強制」と注記

## 完了条件

- 移行対象の全ルールが ESLint / OxLint の設定に反映されている
- pre-commit hook でルール違反がブロックされる
- pre-push hook で厳密チェックが走る
- ルール違反のコードをコミット/プッシュしようとすると失敗する
