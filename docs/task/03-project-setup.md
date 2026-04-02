---
title: プロジェクト初期構築
status: not-started
priority: P0
depends_on: []
related_decisions: [D19]
---

# 03: プロジェクト初期構築

## 概要

Next.js プロジェクトの作成と基盤ツールのセットアップ。

## やること

- [ ] Next.js（App Router）プロジェクト作成
- [ ] TypeScript 設定
- [ ] Tailwind CSS 導入
- [ ] Vercel KV（@vercel/kv）パッケージ導入
- [ ] Gemini API（@google/genai）パッケージ導入
- [ ] ESLint / Prettier 設定
- [ ] .env.local に環境変数テンプレート作成
  - `GEMINI_API_KEY`
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
- [ ] .gitignore 設定
- [ ] 基本ディレクトリ構成の作成

## 完了条件

- `npm run dev` でローカル起動できる
- Vercel KV への接続が確認できる
- Gemini API への疎通が確認できる
