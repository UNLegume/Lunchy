---
title: Figma MCP セットアップ
status: done
priority: P0
depends_on: []
related_decisions: [D21]
---

# 01: Figma MCP セットアップ

## 概要

Claude Code から Figma を操作してUIデザインを作成するために、Figma MCP サーバーをセットアップする。

## 前提条件

- Figma アカウント
- Figma Personal Access Token

## やること

- [ ] Figma Personal Access Token の発行
  - Figma → Settings → Personal Access Tokens
- [ ] `.claude/settings.json` に MCP サーバー設定を追加
  ```json
  {
    "mcpServers": {
      "figma": {
        "command": "npx",
        "args": ["-y", "@anthropic-ai/figma-mcp-server"],
        "env": {
          "FIGMA_ACCESS_TOKEN": "your-token-here"
        }
      }
    }
  }
  ```
- [ ] Claude Code を再起動して MCP サーバーの接続確認
- [ ] Figma プロジェクト/ファイルの作成（Lunchy UI Design）
- [ ] 動作確認（Figma ファイルの読み書きテスト）

## 完了条件

- Claude Code から Figma MCP ツールが利用可能になっている
- Figma ファイルに対して読み書きができる
