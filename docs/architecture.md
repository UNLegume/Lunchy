# アーキテクチャ

## ディレクトリ構成

```
app/                                    # Next.js App Router（ルーティングのみ）
  layout.tsx                            # src/app から import
  page.tsx                              # src/views/home を re-export
  session/
    create/page.tsx                     # src/views/session-create を re-export
    [id]/
      created/page.tsx                  # src/views/session-created を re-export
      join/page.tsx                     # src/views/member-join を re-export
      preferences/page.tsx              # src/views/preferences を re-export
      dashboard/page.tsx                # src/views/dashboard を re-export
      vote/page.tsx                     # src/views/vote を re-export
      result/page.tsx                   # src/views/result を re-export
  api/                                  # API Routes（バックエンド）
    sessions/
      route.ts                          # POST: セッション作成
      [id]/
        route.ts                        # GET: セッション取得
        join/route.ts                   # POST: メンバー参加
        preferences/route.ts            # POST: 好み送信
        close/route.ts                  # POST: 入力締め切り
        generate/route.ts               # POST: AI候補生成
        vote/route.ts                   # POST: 投票
        runoff/route.ts                 # POST: 決選投票
        result/route.ts                 # GET: 結果取得

src/                                    # FSD レイヤー（フロントエンド）
  app/                                  # App層: グローバル設定
    providers/                          # Context providers
    styles/                             # グローバルスタイル
  views/                                # Pages層: ページ単位の組み立て
    home/
    session-create/
    session-created/
    member-join/
    preferences/
    dashboard/
    vote/
    result/
  widgets/                              # Widgets層: 大規模な自己完結ブロック
    preference-wizard/                  # 好み入力5ステップウィザード
    vote-panel/                         # 候補3件表示＋投票選択
    dashboard-panel/                    # メンバー一覧＋進捗＋締め切り
  features/                             # Features層: ユーザーアクション
    create-session/                     # セッション作成フォーム
    join-session/                       # メンバー参加
    submit-preferences/                 # 好み送信
    close-gathering/                    # 入力締め切り（幹事）
    cast-vote/                          # 投票する
    share-url/                          # URL共有・コピー
  entities/                             # Entities層: ビジネスエンティティ
    session/                            # セッション（状態表示含む）
    candidate/                          # 候補店（カード表示含む）
    preference/                         # 好みデータ
  shared/                               # Shared層: 共通基盤
    ui/                                 # Button, Loading, ErrorMessage, ProgressBar, StepIndicator
    api/                                # fetch ラッパー、エラーハンドリング
    lib/                                # 汎用ユーティリティ、定数
    config/                             # 環境変数、設定値

lib/                                    # バックエンド ビジネスロジック
  types.ts                              # 共有型定義（Session, Member, Preference, Candidate, Vote）
  errors.ts                             # APIエラークラス（AppError）
  kv.ts                                 # Vercel KV ヘルパー（get/set/delete + TTL）
  session-service.ts                    # セッション操作のビジネスロジック
  preference-service.ts                 # 好み集計ロジック
  vote-service.ts                       # 投票集計・過半数判定・ランダム決着
  gemini.ts                             # Gemini API連携（プロンプト構築・レスポンスパース）
  validation.ts                         # 入力バリデーション（zodスキーマ）

__tests__/                              # テスト
  lib/                                  # ユニットテスト（lib配下のサービス）
  api/                                  # API Route統合テスト
```

---

## バックエンド: 3層構造

```
API Route（app/api/）
  ↓ リクエスト解析・バリデーション・レスポンス整形
Service（lib/*-service.ts）
  ↓ ビジネスロジック・ルール判定
Data（lib/kv.ts）
  ↓ Vercel KV 読み書き・TTL管理
```

### 各層の責務

**API Route層** — HTTPの入口と出口

- リクエストボディのパース
- zodによるバリデーション（`lib/validation.ts` のスキーマを使用）
- Service層の呼び出し
- 成功レスポンス / エラーレスポンスの整形
- `try/catch` で `AppError` をキャッチし、統一エラー形式で返却

**Service層** — ビジネスルール

- セッション状態の遷移管理（`gathering` → `voting` → `runoff` → `decided`）
- 幹事権限の検証
- 好みの集計（多数派優先 D9）
- 投票の集計・過半数判定・同数ランダム決着（D11）
- Gemini APIへのプロンプト構築と結果パース

**Data層（`lib/kv.ts`）** — データアクセス

- Vercel KV のラッパー関数
- `getSession(id)` / `setSession(id, data)` / `deleteSession(id)`
- TTL 24時間を一元管理
- KVの型安全なシリアライズ/デシリアライズ

### エラーハンドリング

```typescript
// lib/errors.ts
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
  }
}

// API Routeでの使用パターン
try {
  const result = await sessionService.create(validated);
  return NextResponse.json(result, { status: 201 });
} catch (e) {
  if (e instanceof AppError) {
    return NextResponse.json(
      { error: { code: e.code, message: e.message } },
      { status: e.statusCode },
    );
  }
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: '予期しないエラーが発生しました' } },
    { status: 500 },
  );
}
```

---

## フロントエンド: Feature Sliced Design (FSD)

[FSD公式ドキュメント](https://feature-sliced.design/) に基づく。Next.js App Routerとの統合は[公式ガイド](https://feature-sliced.design/docs/guides/tech/with-nextjs)に従う。

### レイヤー構造と依存ルール

```
app → pages → widgets → features → entities → shared
```

**上位レイヤーは下位レイヤーにのみ依存可能。同一レイヤー内のスライス間参照は禁止。**

| レイヤー   | 責務                                            | Lunchyでの例                                   |
| ---------- | ----------------------------------------------- | ---------------------------------------------- |
| `app`      | グローバル設定、providers、レイアウト           | Context providers, グローバルスタイル          |
| `pages`    | ページ単位の組み立て（widgets/features を配置） | home, dashboard, vote, result                  |
| `widgets`  | 大規模な自己完結ブロック                        | preference-wizard, vote-panel, dashboard-panel |
| `features` | ユーザーアクション（ビジネス価値を持つ操作）    | create-session, cast-vote, share-url           |
| `entities` | ビジネスエンティティとその表示                  | session, candidate, preference                 |
| `shared`   | プロジェクト非依存の共通基盤                    | ui（Button等）, api（fetchラッパー）, lib      |

### スライスの内部構造（Segment）

各スライスは以下のセグメントで構成。`index.ts` で公開APIを制御する。

```
src/features/create-session/
  ui/
    CreateSessionForm.tsx
  api/
    createSession.ts
  model/
    schema.ts           # zodバリデーション
  index.ts              # 公開API（re-export）
```

| Segment  | 用途                               |
| -------- | ---------------------------------- |
| `ui/`    | UIコンポーネント                   |
| `api/`   | API通信関数                        |
| `model/` | 型定義、スキーマ、ビジネスロジック |
| `lib/`   | スライス内ユーティリティ           |

### Next.js App Router との統合

`app/` はルーティングのみ。ページ実体は `src/views/` に置き、re-exportする。

```typescript
// app/session/[id]/vote/page.tsx
export { VotePage as default } from '@/views/vote';
```

### Server Components vs Client Components

- **Server Components（デフォルト）**: `app/` のレイアウト、`src/views/` のページシェル
- **Client Components（`'use client'`）**: `features/` のフォーム・操作UI、`widgets/` のインタラクティブブロック

### 状態管理

外部ライブラリは使わない。

| 用途           | 手段                                                        |
| -------------- | ----------------------------------------------------------- |
| ページ内状態   | `useState` — フォーム入力、UIの開閉状態                     |
| ステップ管理   | `useState` — 好み入力の5ステップ進行                        |
| サーバーデータ | カスタムフック（`entities/session/`内）— fetch + ポーリング |
| URL由来の状態  | `useParams` — セッションID                                  |

### API通信パターン

- **読み取り（GET）**: `entities/` のカスタムフックで fetch + ポーリング
- **書き込み（POST）**: `features/` の `api/` セグメントに配置

```typescript
// src/entities/session/api/getSession.ts
export async function getSession(id: string): Promise<Session> { ... }

// src/features/cast-vote/api/castVote.ts
export async function castVote(sessionId: string, candidateId: string): Promise<void> { ... }
```

---

## テスト構成

```
__tests__/
  lib/
    kv.test.ts                  # KVヘルパーのユニットテスト
    session-service.test.ts     # セッション操作
    preference-service.test.ts  # 好み集計
    vote-service.test.ts        # 投票ロジック（過半数・同数・ランダム）
    validation.test.ts          # バリデーションスキーマ
    gemini.test.ts              # Gemini API連携（モック使用）
  api/
    sessions.test.ts            # POST /api/sessions
    session-detail.test.ts      # GET /api/sessions/[id]
    join.test.ts                # POST join
    preferences.test.ts         # POST preferences
    close.test.ts               # POST close
    generate.test.ts            # POST generate
    vote.test.ts                # POST vote
    runoff.test.ts              # POST runoff
    result.test.ts              # GET result
```

- **`lib/` のテスト**: 純粋なユニットテスト。KVはモック（`@vercel/kv` をモック）
- **`api/` のテスト**: Next.jsのAPI Routeハンドラを直接呼び出す統合テスト。KVはモック
- **Gemini API**: 外部呼び出しはモック。レスポンスパースのテストに注力
- **フロントエンド**: Playwright MCPでのビジュアルチェックが主（ユニットテストは書かない）

---

## セッションデータのライフサイクル

```
作成 → gathering → [幹事が締め切り] → voting → [全員投票完了]
  → 過半数あり → decided
  → 過半数なし → runoff → [全員再投票] → decided
                                        （同数ならランダム D11）
```

すべてのデータはVercel KVに保存。TTL 24時間で自動削除。
