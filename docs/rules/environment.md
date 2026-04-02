# 環境変数

- `.env.local` で管理、`.env.example` にキー名のみコミット
- 起動時に必須環境変数の存在チェック（なければエラー）
- 必要なキー:
  - `GEMINI_API_KEY`
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
