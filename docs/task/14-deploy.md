---
title: Vercelデプロイ
status: not-started
priority: P1
depends_on: [03]
related_decisions: [D19, D23]
---

# 14: Vercelデプロイ

## 概要

Vercel にプロジェクトをデプロイし、本番環境を構築する。

## やること

- [ ] Vercel プロジェクト作成
- [ ] GitHub リポジトリとの連携
- [ ] 環境変数の設定
  - `GEMINI_API_KEY`
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
- [ ] Vercel KV ストアの作成・接続
- [ ] デプロイ動作確認
- [ ] カスタムドメイン設定（任意）

## 完了条件

- Vercel 上でアプリが動作する
- Vercel KV に接続できる
- Gemini API が本番環境から呼び出せる
- git push で自動デプロイされる
