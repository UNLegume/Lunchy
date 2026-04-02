---
title: データモデル・API設計
status: not-started
priority: P0
depends_on: [03]
related_decisions: [D5, D7, D17, D19, D22]
---

# 05: データモデル・API設計

## 概要

Vercel KV に保存するセッションデータの構造と、API Routesのエンドポイント設計。

## データモデル

### Session

```typescript
type Session = {
  id: string; // UUID（URLの一部）
  organizerId: string; // 幹事のメンバーID
  location: string; // オフィスの住所
  status: 'gathering' | 'voting' | 'runoff' | 'decided';
  members: Member[];
  preferences: Preference[];
  candidates: Candidate[]; // AI生成の候補3件
  votes: Vote[];
  runoffVotes: Vote[]; // 決選投票
  result: Candidate | null;
  createdAt: string;
};
```

### Member

```typescript
type Member = {
  id: string;
  displayName: string;
  isOrganizer: boolean;
};
```

### Preference

```typescript
type Preference = {
  memberId: string;
  allergy: string[]; // アレルギー項目
  category: 'meat' | 'fish' | 'other';
  hungerLevel: number; // 0-10
  place: string | null; // 食べたい場所（スキップ可）
  budget: string; // 予算レンジ
};
```

### Candidate

```typescript
type Candidate = {
  id: string;
  name: string; // 店名
  genre: string; // ジャンル
  walkMinutes: number; // 徒歩時間
  rating: number; // 評価（星）
  priceRange: string; // 価格帯
  photoUrl: string; // 写真1枚
};
```

### Vote

```typescript
type Vote = {
  memberId: string;
  candidateId: string;
};
```

## API エンドポイント

| メソッド | パス                             | 説明                     |
| -------- | -------------------------------- | ------------------------ |
| POST     | `/api/sessions`                  | セッション作成           |
| GET      | `/api/sessions/[id]`             | セッション取得           |
| POST     | `/api/sessions/[id]/join`        | メンバー参加             |
| POST     | `/api/sessions/[id]/preferences` | 好み入力送信             |
| POST     | `/api/sessions/[id]/close`       | 入力締め切り（幹事のみ） |
| POST     | `/api/sessions/[id]/generate`    | AI候補生成               |
| POST     | `/api/sessions/[id]/vote`        | 投票                     |
| POST     | `/api/sessions/[id]/runoff`      | 決選投票開始             |
| GET      | `/api/sessions/[id]/result`      | 結果取得                 |

## やること

- [ ] TypeScript 型定義ファイル作成
- [ ] API Routes のスケルトン作成
- [ ] Vercel KV のヘルパー関数作成（get/set/delete）
- [ ] セッションの TTL 設定（例: 24時間で自動削除）

## 完了条件

- 全エンドポイントがスケルトンとして存在する
- 型定義が完了している
- KV への読み書きヘルパーが動作する
