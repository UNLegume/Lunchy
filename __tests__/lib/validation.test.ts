import { describe, it, expect } from 'vitest';
import {
  createSessionSchema,
  joinSessionSchema,
  preferencesSchema,
  voteSchema,
} from '@/lib/validation';

describe('createSessionSchema', () => {
  it('有効な displayName と location を受け付ける', () => {
    const result = createSessionSchema.safeParse({ displayName: '山田太郎', location: '渋谷駅' });
    expect(result.success).toBe(true);
  });

  it('displayName が20文字を受け付ける', () => {
    const result = createSessionSchema.safeParse({
      displayName: 'a'.repeat(20),
      location: '渋谷駅',
    });
    expect(result.success).toBe(true);
  });

  it('displayName が21文字以上を拒否する', () => {
    const result = createSessionSchema.safeParse({
      displayName: 'a'.repeat(21),
      location: '渋谷駅',
    });
    expect(result.success).toBe(false);
  });

  it('空の displayName を拒否する', () => {
    const result = createSessionSchema.safeParse({ displayName: '', location: '渋谷駅' });
    expect(result.success).toBe(false);
  });

  it('displayName が未指定の場合を拒否する', () => {
    const result = createSessionSchema.safeParse({ location: '渋谷駅' });
    expect(result.success).toBe(false);
  });

  it('空の location を拒否する', () => {
    const result = createSessionSchema.safeParse({ displayName: '山田太郎', location: '' });
    expect(result.success).toBe(false);
  });

  it('location が未指定の場合を拒否する', () => {
    const result = createSessionSchema.safeParse({ displayName: '山田太郎' });
    expect(result.success).toBe(false);
  });
});

describe('joinSessionSchema', () => {
  it('有効な displayName を受け付ける', () => {
    const result = joinSessionSchema.safeParse({ displayName: '太郎' });
    expect(result.success).toBe(true);
  });

  it('20文字の displayName を受け付ける', () => {
    const result = joinSessionSchema.safeParse({ displayName: 'a'.repeat(20) });
    expect(result.success).toBe(true);
  });

  it('空の displayName を拒否する', () => {
    const result = joinSessionSchema.safeParse({ displayName: '' });
    expect(result.success).toBe(false);
  });

  it('21文字以上の displayName を拒否する', () => {
    const result = joinSessionSchema.safeParse({ displayName: 'a'.repeat(21) });
    expect(result.success).toBe(false);
  });
});

describe('preferencesSchema', () => {
  const validPreferences = {
    memberId: 'member-uuid',
    allergy: ['えび', '小麦'],
    category: 'meat' as const,
    hungerLevel: 5,
    place: null,
    budget: '1000円',
  };

  it('有効な preferences を受け付ける', () => {
    const result = preferencesSchema.safeParse(validPreferences);
    expect(result.success).toBe(true);
  });

  it('category が fish でも受け付ける', () => {
    const result = preferencesSchema.safeParse({ ...validPreferences, category: 'fish' });
    expect(result.success).toBe(true);
  });

  it('category が other でも受け付ける', () => {
    const result = preferencesSchema.safeParse({ ...validPreferences, category: 'other' });
    expect(result.success).toBe(true);
  });

  it('不正な category を拒否する', () => {
    const result = preferencesSchema.safeParse({ ...validPreferences, category: 'vegan' });
    expect(result.success).toBe(false);
  });

  it('hungerLevel が 0 を受け付ける', () => {
    const result = preferencesSchema.safeParse({ ...validPreferences, hungerLevel: 0 });
    expect(result.success).toBe(true);
  });

  it('hungerLevel が 10 を受け付ける', () => {
    const result = preferencesSchema.safeParse({ ...validPreferences, hungerLevel: 10 });
    expect(result.success).toBe(true);
  });

  it('hungerLevel が -1 を拒否する', () => {
    const result = preferencesSchema.safeParse({ ...validPreferences, hungerLevel: -1 });
    expect(result.success).toBe(false);
  });

  it('hungerLevel が 11 を拒否する', () => {
    const result = preferencesSchema.safeParse({ ...validPreferences, hungerLevel: 11 });
    expect(result.success).toBe(false);
  });

  it('hungerLevel が小数を拒否する', () => {
    const result = preferencesSchema.safeParse({ ...validPreferences, hungerLevel: 3.5 });
    expect(result.success).toBe(false);
  });

  it('place が文字列でも受け付ける', () => {
    const result = preferencesSchema.safeParse({ ...validPreferences, place: '新宿駅近く' });
    expect(result.success).toBe(true);
  });

  it('memberId が未指定の場合を拒否する', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { memberId: _memberId, ...withoutMemberId } = validPreferences;
    const result = preferencesSchema.safeParse(withoutMemberId);
    expect(result.success).toBe(false);
  });

  it('空の memberId を拒否する', () => {
    const result = preferencesSchema.safeParse({ ...validPreferences, memberId: '' });
    expect(result.success).toBe(false);
  });
});

describe('voteSchema', () => {
  it('有効な candidateId を受け付ける', () => {
    const result = voteSchema.safeParse({ candidateId: 'candidate-1' });
    expect(result.success).toBe(true);
  });

  it('空の candidateId を拒否する', () => {
    const result = voteSchema.safeParse({ candidateId: '' });
    expect(result.success).toBe(false);
  });

  it('candidateId が未指定の場合を拒否する', () => {
    const result = voteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
