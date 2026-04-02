import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  class GoogleGenAI {
    models = { generateContent: mockGenerateContent };
    constructor(_options: { apiKey: string }) {}
  }
  return { GoogleGenAI };
});

import { buildPrompt, parseCandidates, generateCandidates } from '@/lib/gemini';
import { AppError } from '@/lib/errors';
import type { Preference } from '@/lib/types';
import type { AggregatedPreferences } from '@/lib/preference-service';

const sampleAggregated: AggregatedPreferences = {
  category: 'meat',
  budget: '~1000',
  allergies: ['卵'],
  avgHungerLevel: 7.0,
  places: [],
};

const samplePreferences: Preference[] = [
  {
    memberId: 'member-1',
    allergy: ['卵'],
    category: 'meat',
    hungerLevel: 7,
    place: null,
    budget: '~1000円',
  },
];

const validCandidateJson = JSON.stringify([
  {
    name: '焼肉屋A',
    genre: '焼肉',
    walkMinutes: 5,
    rating: 4.2,
    priceRange: '~1000円',
    photoUrl: 'https://example.com/photo.jpg',
  },
  {
    name: '牛丼屋B',
    genre: '牛丼',
    walkMinutes: 3,
    rating: 3.8,
    priceRange: '~600円',
    photoUrl: '',
  },
  {
    name: 'ステーキCafe',
    genre: 'ステーキ',
    walkMinutes: 8,
    rating: 4.5,
    priceRange: '~2000円',
    photoUrl: 'https://example.com/steak.jpg',
  },
]);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('buildPrompt', () => {
  it('location が含まれるプロンプトを生成する', () => {
    const prompt = buildPrompt('渋谷駅', sampleAggregated);
    expect(prompt).toContain('渋谷駅');
  });

  it('カテゴリが含まれるプロンプトを生成する', () => {
    const prompt = buildPrompt('渋谷駅', sampleAggregated);
    expect(prompt).toContain('meat');
  });

  it('予算が含まれるプロンプトを生成する', () => {
    const prompt = buildPrompt('渋谷駅', sampleAggregated);
    expect(prompt).toContain('1,000円以下');
  });

  it('アレルギーが含まれるプロンプトを生成する', () => {
    const prompt = buildPrompt('渋谷駅', sampleAggregated);
    expect(prompt).toContain('卵');
  });

  it('アレルギーなしの場合「なし」が含まれる', () => {
    const noAllergy: AggregatedPreferences = { ...sampleAggregated, allergies: [] };
    const prompt = buildPrompt('渋谷駅', noAllergy);
    expect(prompt).toContain('なし');
  });

  it('hungerLevel が含まれるプロンプトを生成する', () => {
    const prompt = buildPrompt('渋谷駅', sampleAggregated);
    expect(prompt).toContain('7');
  });

  it('JSON配列の返却指示が含まれる', () => {
    const prompt = buildPrompt('渋谷駅', sampleAggregated);
    expect(prompt).toContain('JSON');
  });

  it('個人店優先の指示が含まれる', () => {
    const prompt = buildPrompt('渋谷駅', sampleAggregated);
    expect(prompt).toContain('チェーン店');
    expect(prompt).toContain('個人経営');
  });
});

describe('parseCandidates', () => {
  it('正常なJSON配列をパースして Candidate[] を返す', () => {
    const candidates = parseCandidates(validCandidateJson);
    expect(candidates).toHaveLength(3);
    expect(candidates[0].name).toBe('焼肉屋A');
    expect(candidates[0].id).toBeDefined();
    expect(typeof candidates[0].id).toBe('string');
  });

  it('各候補に UUID の id を付与する', () => {
    const candidates = parseCandidates(validCandidateJson);
    const ids = candidates.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });

  it('マークダウンコードブロック内のJSONをパースできる', () => {
    const markdown = `以下の結果です。\n\`\`\`json\n${validCandidateJson}\n\`\`\`\nご参考ください。`;
    const candidates = parseCandidates(markdown);
    expect(candidates).toHaveLength(3);
    expect(candidates[0].name).toBe('焼肉屋A');
  });

  it('テキストに埋め込まれたJSONをパースできる', () => {
    const text = `以下のお店をお勧めします。${validCandidateJson} いかがでしょうか。`;
    const candidates = parseCandidates(text);
    expect(candidates).toHaveLength(3);
  });

  it('不正なJSONの場合 AppError を投げる', () => {
    expect(() => parseCandidates('これはJSONではありません')).toThrow(AppError);
  });

  it('空の配列の場合 AppError を投げる', () => {
    expect(() => parseCandidates('[]')).toThrow(AppError);
  });
});

describe('generateCandidates', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  it('正常系: Gemini API を呼び出して候補リストを返す', async () => {
    mockGenerateContent.mockResolvedValue({ text: validCandidateJson });

    const candidates = await generateCandidates('渋谷駅', samplePreferences);
    expect(candidates).toHaveLength(3);
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  it('Gemini API が undefined text を返した場合 AppError を投げる', async () => {
    mockGenerateContent.mockResolvedValue({ text: undefined });

    await expect(generateCandidates('渋谷駅', samplePreferences)).rejects.toThrow(AppError);
  });

  it('Gemini API がエラーを投げた場合 GEMINI_ERROR コードの AppError を投げる', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'));

    try {
      await generateCandidates('渋谷駅', samplePreferences);
      expect.fail('エラーが投げられるべきでした');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe('GEMINI_ERROR');
    }
  });

  it('GEMINI_API_KEY が未設定の場合 AppError を投げる', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(generateCandidates('渋谷駅', samplePreferences)).rejects.toThrow(AppError);
  });
});
