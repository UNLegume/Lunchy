# コーディング規約

※ ESLint / OxLint で強制するルール（`any`型、`console`、未使用変数等）はリンター設定に委譲。ここにはツールで検出できない規約のみ記載。

## ファイル配置

- 画面固有コンポーネント: `app/` 配下に同居
- 共通コンポーネント: `components/`

## 命名

- コンポーネント: PascalCase (`SessionCard.tsx`)
- ユーティリティ: camelCase (`formatDate.ts`)
- ディレクトリ: kebab-case (`session-create/`)

## コンポーネント

- 関数コンポーネント + hooks を使用する
- スタイリングは Tailwind CSS のユーティリティクラスを使用する

## API レスポンス

- 成功: 適切な HTTP ステータス + データ本体
- エラー: `{ error: { code: string, message: string } }` + 適切な HTTP ステータス
- ユーザー向けエラーメッセージは平易な日本語にする（スタックトレースを含めない）
- 入力値はサーバー側でサニタイズする
