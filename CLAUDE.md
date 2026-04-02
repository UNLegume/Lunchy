# Lunchy

チームのランチ店選びを民主的に決めるWebサービス。
Next.js (App Router) / TypeScript (strict) / Tailwind CSS / Vercel + Vercel KV / Gemini API (Grounding with Google Maps)

## Commands

```bash
npm run dev          # ローカル起動
npm run build        # ビルド
npm run lint         # ESLint
npm test             # テスト実行
```

## IMPORTANT: 実装の鉄則

- 実装前に必ず `docs/task/XX-*.md` と `docs/lunchy-requirements.md` の該当 Decision を読む
- 実装サイクル: 探索 → 計画 → 実装 → 検証。スキップしない
- バックエンドは TDD（Red → Green → Refactor）で実装する
- フロントエンドはコンポーネント単体 → 組み合わせ → ページの順で構築する
- ページ変更後は Playwright MCP でスマホ(375px) + PC(1280px) のスクリーンショットを撮り、崩れがなくなるまで修正ループを回す
- 最低限の機能のみ実装する。タスクと要件定義の記載範囲を超えない
- パッケージ追加・`any` 型使用は AskUserQuestion でユーザーに確認してから行う
- ドキュメントとの乖離を見つけたら実装を止めてユーザーに確認する
- 課題・疑問はドキュメントの Implementation Q&A に記録する（TODO コメントは使わない）

## 作業委託

Opus: 指揮・判断 / Sonnet: 実装・テスト / Explore: 調査

## 落とし穴

- Gemini Grounding with Google Maps は新しい機能。徒歩距離・営業時間フィルタの精度は実装時に検証が必要
- セッションデータは Vercel KV に一時保存。TTL 設定を忘れると古いデータが残り続ける
- 投票は無記名。API で memberId と投票内容の紐づきをレスポンスに含めないこと

## 詳細ドキュメント（必要時に参照）

| 状況           | 参照先                                                           |
| -------------- | ---------------------------------------------------------------- |
| アーキテクチャ | [docs/architecture.md](docs/architecture.md)                     |
| 実装フロー詳細 | [docs/rules/workflow.md](docs/rules/workflow.md)                 |
| コード規約     | [docs/rules/coding-standards.md](docs/rules/coding-standards.md) |
| テスト方針     | [docs/rules/testing.md](docs/rules/testing.md)                   |
| Git運用        | [docs/rules/git.md](docs/rules/git.md)                           |
| 環境変数       | [docs/rules/environment.md](docs/rules/environment.md)           |
| 要件定義       | [docs/lunchy-requirements.md](docs/lunchy-requirements.md)       |
| タスク一覧     | [docs/task/00-overview.md](docs/task/00-overview.md)             |

## コンテキスト管理

- コンテキストが20%を超えたら `/clear` または `/compact` を実行する
- コミット・プッシュ・タスク完了後にも `/clear` する

## IMPORTANT: 再掲

タスクと要件定義の範囲を超える作業・機能追加・リファクタリングは行わない。迷ったらユーザーに確認する。
