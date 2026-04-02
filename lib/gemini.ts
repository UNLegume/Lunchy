import { GoogleGenAI } from '@google/genai';
import { AppError } from '@/lib/errors';
import { aggregatePreferences, type AggregatedPreferences } from '@/lib/preference-service';
import type { Candidate, Preference } from '@/lib/types';

export function buildPrompt(location: string, aggregated: AggregatedPreferences): string {
  const allergyText = aggregated.allergies.length > 0 ? aggregated.allergies.join('、') : 'なし';

  return `あなたはランチの店選びアシスタントです。
以下の条件に合う飲食店を、Google Mapsのデータを使って3件提案してください。

【基準地点】${location}
【検索範囲】徒歩10分以内
【条件】
- 現在ランチタイム営業中であること
- カテゴリ: ${aggregated.category}（多数派の希望）
- 予算: ${aggregated.budget}
- アレルギー除外: ${allergyText}
- 空腹度平均: ${aggregated.avgHungerLevel}/10（高い場合はボリュームのある店を優先）

各候補について以下の情報を**必ずJSON配列**で返してください。JSON以外のテキストは含めないでください:
[
  {
    "name": "店名",
    "genre": "ジャンル",
    "walkMinutes": 徒歩時間（数値）,
    "rating": Google Maps評価（数値）,
    "priceRange": "価格帯",
    "photoUrl": "写真URL（取得できない場合は空文字）"
  }
]`;
}

type RawCandidate = {
  name: string;
  genre: string;
  walkMinutes: number;
  rating: number;
  priceRange: string;
  photoUrl: string;
};

export function parseCandidates(responseText: string): Candidate[] {
  const match = responseText.match(/\[[\s\S]*\]/);
  if (!match) {
    throw new AppError(
      'PARSE_ERROR',
      'Geminiのレスポンスから候補リストを取得できませんでした',
      500,
    );
  }

  let parsed: RawCandidate[];
  try {
    parsed = JSON.parse(match[0]) as RawCandidate[];
  } catch {
    throw new AppError('PARSE_ERROR', 'Geminiのレスポンスのパースに失敗しました', 500);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new AppError('PARSE_ERROR', 'Geminiのレスポンスに候補が含まれていませんでした', 500);
  }

  return parsed.map((item) => ({
    id: crypto.randomUUID(),
    name: item.name,
    genre: item.genre,
    walkMinutes: item.walkMinutes,
    rating: item.rating,
    priceRange: item.priceRange,
    photoUrl: item.photoUrl,
  }));
}

export async function generateCandidates(
  location: string,
  preferences: Preference[],
): Promise<Candidate[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError('GEMINI_ERROR', 'GEMINI_API_KEY が設定されていません', 500);
  }

  const aggregated = aggregatePreferences(preferences);
  const prompt = buildPrompt(location, aggregated);

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) {
      throw new AppError('GEMINI_ERROR', 'Gemini APIからテキストが返却されませんでした', 500);
    }

    return parseCandidates(text);
  } catch (e) {
    if (e instanceof AppError) {
      throw e;
    }
    throw new AppError('GEMINI_ERROR', `Gemini API 呼び出しに失敗しました: ${String(e)}`, 500);
  }
}
