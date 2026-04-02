import { describe, it, expect } from 'vitest';
import { aggregatePreferences } from '@/lib/preference-service';
import type { Preference } from '@/lib/types';

const makePreference = (overrides: Partial<Preference> = {}): Preference => ({
  memberId: 'member-1',
  allergy: [],
  category: 'meat',
  hungerLevel: 5,
  place: null,
  budget: '~1000円',
  ...overrides,
});

describe('aggregatePreferences', () => {
  describe('category の集約', () => {
    it('全員同じカテゴリの場合、そのカテゴリを返す', () => {
      const preferences: Preference[] = [
        makePreference({ category: 'fish' }),
        makePreference({ category: 'fish' }),
        makePreference({ category: 'fish' }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.category).toBe('fish');
    });

    it('多数派のカテゴリを返す', () => {
      const preferences: Preference[] = [
        makePreference({ category: 'meat' }),
        makePreference({ category: 'fish' }),
        makePreference({ category: 'fish' }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.category).toBe('fish');
    });

    it('meat と fish が同数の場合は meat を優先する', () => {
      const preferences: Preference[] = [
        makePreference({ category: 'meat' }),
        makePreference({ category: 'fish' }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.category).toBe('meat');
    });

    it('meat と other が同数の場合は meat を優先する', () => {
      const preferences: Preference[] = [
        makePreference({ category: 'meat' }),
        makePreference({ category: 'other' }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.category).toBe('meat');
    });

    it('fish と other が同数の場合は fish を優先する', () => {
      const preferences: Preference[] = [
        makePreference({ category: 'fish' }),
        makePreference({ category: 'other' }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.category).toBe('fish');
    });

    it('全カテゴリが同数の場合は meat を優先する', () => {
      const preferences: Preference[] = [
        makePreference({ category: 'meat' }),
        makePreference({ category: 'fish' }),
        makePreference({ category: 'other' }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.category).toBe('meat');
    });
  });

  describe('budget の集約', () => {
    it('全員同じ予算の場合、その予算を返す', () => {
      const preferences: Preference[] = [
        makePreference({ budget: '~1000円' }),
        makePreference({ budget: '~1000円' }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.budget).toBe('~1000円');
    });

    it('多数派の予算を返す', () => {
      const preferences: Preference[] = [
        makePreference({ budget: '~1000円' }),
        makePreference({ budget: '~2000円' }),
        makePreference({ budget: '~2000円' }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.budget).toBe('~2000円');
    });

    it('同数の場合は配列で先に来る（より安い）方を優先する', () => {
      const preferences: Preference[] = [
        makePreference({ budget: '~2000円' }),
        makePreference({ budget: '~1000円' }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.budget).toBe('~2000円');
    });
  });

  describe('allergies の集約', () => {
    it('アレルギーなしの場合、空配列を返す', () => {
      const preferences: Preference[] = [
        makePreference({ allergy: [] }),
        makePreference({ allergy: [] }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.allergies).toEqual([]);
    });

    it('全員のアレルギーをユニーク化して返す', () => {
      const preferences: Preference[] = [
        makePreference({ allergy: ['卵', '乳'] }),
        makePreference({ allergy: ['乳', '小麦'] }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.allergies).toEqual(expect.arrayContaining(['卵', '乳', '小麦']));
      expect(result.allergies).toHaveLength(3);
    });

    it('1人でもアレルギーがあれば全体で除外リストに含まれる', () => {
      const preferences: Preference[] = [
        makePreference({ allergy: ['えび'] }),
        makePreference({ allergy: [] }),
        makePreference({ allergy: [] }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.allergies).toContain('えび');
    });
  });

  describe('avgHungerLevel の計算', () => {
    it('全員同じhungerLevelの場合、その値を返す', () => {
      const preferences: Preference[] = [
        makePreference({ hungerLevel: 7 }),
        makePreference({ hungerLevel: 7 }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.avgHungerLevel).toBe(7.0);
    });

    it('hungerLevel の平均を小数点1桁で返す', () => {
      const preferences: Preference[] = [
        makePreference({ hungerLevel: 3 }),
        makePreference({ hungerLevel: 5 }),
        makePreference({ hungerLevel: 8 }),
      ];
      const result = aggregatePreferences(preferences);
      // (3 + 5 + 8) / 3 = 5.333... → 5.3
      expect(result.avgHungerLevel).toBe(5.3);
    });
  });

  describe('places の集約', () => {
    it('place が null でないものの配列を返す', () => {
      const preferences: Preference[] = [
        makePreference({ place: '焼肉屋A' }),
        makePreference({ place: null }),
        makePreference({ place: '寿司屋B' }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.places).toEqual(['焼肉屋A', '寿司屋B']);
    });

    it('全員 place が null の場合、空配列を返す', () => {
      const preferences: Preference[] = [
        makePreference({ place: null }),
        makePreference({ place: null }),
      ];
      const result = aggregatePreferences(preferences);
      expect(result.places).toEqual([]);
    });
  });

  describe('空の好みリスト', () => {
    it('空配列の場合はデフォルト値を返す', () => {
      const result = aggregatePreferences([]);
      expect(result.category).toBe('meat');
      expect(result.budget).toBe('');
      expect(result.allergies).toEqual([]);
      expect(result.avgHungerLevel).toBe(0);
      expect(result.places).toEqual([]);
    });
  });
});
