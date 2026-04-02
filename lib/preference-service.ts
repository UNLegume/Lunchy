import type { Preference } from '@/lib/types';

export type AggregatedPreferences = {
  category: 'meat' | 'fish' | 'other';
  budget: string;
  allergies: string[];
  avgHungerLevel: number;
  places: string[];
};

const CATEGORY_PRIORITY: Array<'meat' | 'fish' | 'other'> = ['meat', 'fish', 'other'];

function mostFrequent<T>(items: T[], priority: T[]): T {
  if (items.length === 0) return priority[0];

  const counts = new Map<T, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  const maxCount = Math.max(...counts.values());
  const tied = priority.filter((p) => counts.get(p) === maxCount);
  return tied.length > 0 ? tied[0] : items[0];
}

export function aggregatePreferences(preferences: Preference[]): AggregatedPreferences {
  if (preferences.length === 0) {
    return {
      category: 'meat',
      budget: '',
      allergies: [],
      avgHungerLevel: 0,
      places: [],
    };
  }

  const categories = preferences.map((p) => p.category);
  const category = mostFrequent(categories, CATEGORY_PRIORITY);

  const budgets = preferences.map((p) => p.budget);
  const uniqueBudgets = [...new Set(budgets)];
  const budget = mostFrequent(budgets, uniqueBudgets);

  const allergies = [...new Set(preferences.flatMap((p) => p.allergy))];

  const totalHunger = preferences.reduce((sum, p) => sum + p.hungerLevel, 0);
  const avgHungerLevel = Math.round((totalHunger / preferences.length) * 10) / 10;

  const places = preferences.map((p) => p.place).filter((p): p is string => p !== null);

  return { category, budget, allergies, avgHungerLevel, places };
}
