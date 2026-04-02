---
title: AI候補生成（Gemini + Google Maps）
status: not-started
priority: P0
depends_on: [05]
related_decisions: [D7, D8, D9, D15, D16, D20, D26]
---

# 06: AI候補生成（Gemini + Google Maps）

## 概要

全員の好みを集約し、Gemini API（Grounding with Google Maps）で飲食店の候補3件を生成する。

## 処理フロー

1. セッションから全メンバーの好みデータを取得
2. 多数派の好みを集計（D9: 多数派最優先）
3. Gemini API に以下を渡す:
   - オフィスの住所（基準点）
   - 集約された好み（多数派）
   - 制約条件: 徒歩10分以内、営業中
4. Gemini が Google Maps データを参照して候補3件を返す
5. 候補をパースしてセッションに保存

## プロンプト設計（案）

```
あなたはランチの店選びアシスタントです。
以下の条件に合う飲食店を、Google Mapsのデータを使って3件提案してください。

【基準地点】{location}
【検索範囲】徒歩10分以内
【条件】
- 現在ランチタイム営業中であること
- カテゴリ: {majority_category}（多数派の希望）
- 予算: {majority_budget}
- アレルギー除外: {allergies}
- 空腹度平均: {avg_hunger}（高い場合はボリュームのある店を優先）

各候補について以下の情報をJSON形式で返してください:
- name: 店名
- genre: ジャンル
- walkMinutes: 徒歩時間（分）
- rating: Google Maps評価（星）
- priceRange: 価格帯
- photoUrl: 写真URL
```

## やること

- [ ] 好みデータの集約ロジック（多数決）
- [ ] Gemini API 呼び出し実装（Grounding with Google Maps）
- [ ] プロンプトの作成とチューニング
- [ ] レスポンスのパース（JSON抽出）
- [ ] `POST /api/sessions/[id]/generate` の実装
- [ ] エラーハンドリング（API失敗時のリトライ・フォールバック）
- [ ] 「徒歩10分以内」「営業中」フィルタの精度検証

## 検証ポイント（Open Questions）

- Grounding with Google Maps で徒歩距離のフィルタリングがどこまで正確か
- 写真URLが取得できるか（取得できない場合はプレースホルダー対応）
- レスポンス形式の安定性（JSON で返るか）

## 完了条件

- 好みデータから Gemini API を呼び出して候補3件が返る
- 候補データが正しくパースされてセッションに保存される
- 基準地点から徒歩圏内の営業中の店が返る（精度は許容範囲内）
