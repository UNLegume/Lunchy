'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar, SelectCard, ToggleChip, Button } from '@/src/shared/ui';
import { apiPost } from '@/src/shared/api/client';
import type { Session } from '@/lib/types';

const ALLERGY_OPTIONS = ['卵', '乳', '小麦', 'えび', 'かに', 'そば', '落花生'];

type CategoryChoice = 'meat' | 'fish' | 'other';
type CategoryUI = 'meat' | 'fish' | 'veggie' | 'anything';
type PlaceChoice = 'dine-in' | 'takeout' | null;
type BudgetChoice = '~1000' | '1000~1500' | '1500~' | 'any';

type PreferenceWizardProps = {
  sessionId: string;
};

type SubmitResponse = {
  session: Session;
};

export function PreferenceWizard({ sessionId }: PreferenceWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: アレルギー
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState('');

  // Step 2: 気分（UIの選択肢を区別するための内部状態）
  const [categoryUI, setCategoryUI] = useState<CategoryUI | null>(null);

  function getCategoryValue(ui: CategoryUI): CategoryChoice {
    if (ui === 'meat') return 'meat';
    if (ui === 'fish') return 'fish';
    return 'other';
  }

  // Step 3: 空腹度
  const [hungerLevel, setHungerLevel] = useState<number | null>(null);

  // Step 4: 場所
  const [place, setPlace] = useState<PlaceChoice | undefined>(undefined);

  // Step 5: 予算
  const [budget, setBudget] = useState<BudgetChoice | null>(null);

  const TOTAL_STEPS = 5;

  function toggleAllergy(item: string) {
    setSelectedAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item],
    );
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  function handleNext() {
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    const memberId = localStorage.getItem(`lunchy_member_${sessionId}`);
    if (!memberId) {
      setError('メンバー情報が見つかりません。参加リンクから再度アクセスしてください。');
      return;
    }

    const allergyList = [
      ...selectedAllergies,
      ...(otherAllergy.trim() ? [otherAllergy.trim()] : []),
    ];

    setSubmitting(true);
    setError(null);

    try {
      await apiPost<SubmitResponse>(`/api/sessions/${sessionId}/preferences`, {
        memberId,
        allergy: allergyList,
        category: categoryUI ? getCategoryValue(categoryUI) : 'other',
        hungerLevel: hungerLevel ?? 5,
        place: place ?? null,
        budget: budget ?? 'any',
      });
      router.push(`/session/${sessionId}/complete`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F3F4F6]">
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <div className="max-w-md mx-auto px-4 pt-4 pb-8">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 text-[#6B7280] text-sm flex items-center gap-1 hover:text-[#1A1A1A]"
          >
            ← 戻る
          </button>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">アレルギーはありますか？</h1>
            <p className="text-sm text-[#6B7280] mb-6">該当するものを選んでください（複数可）</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {ALLERGY_OPTIONS.map((item) => (
                <ToggleChip
                  key={item}
                  label={item}
                  selected={selectedAllergies.includes(item)}
                  onClick={() => toggleAllergy(item)}
                />
              ))}
            </div>
            <div className="mb-8">
              <label className="text-sm text-[#6B7280] block mb-1">その他（任意）</label>
              <input
                type="text"
                value={otherAllergy}
                onChange={(e) => setOtherAllergy(e.target.value)}
                placeholder="例: いちご"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
            <Button onClick={handleNext}>次へ</Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">今日の気分は？</h1>
            <p className="text-sm text-[#6B7280] mb-6">食べたいものを選んでください</p>
            <div className="flex flex-col gap-3 mb-8">
              <SelectCard
                emoji="🥩"
                label="肉"
                selected={categoryUI === 'meat'}
                onClick={() => setCategoryUI('meat')}
              />
              <SelectCard
                emoji="🐟"
                label="魚"
                selected={categoryUI === 'fish'}
                onClick={() => setCategoryUI('fish')}
              />
              <SelectCard
                emoji="🥗"
                label="野菜・ヘルシー"
                selected={categoryUI === 'veggie'}
                onClick={() => setCategoryUI('veggie')}
              />
              <SelectCard
                emoji="🍽️"
                label="なんでも"
                selected={categoryUI === 'anything'}
                onClick={() => setCategoryUI('anything')}
              />
            </div>
            <Button onClick={handleNext} disabled={categoryUI === null}>
              次へ
            </Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">お腹の空き具合は？</h1>
            <p className="text-sm text-[#6B7280] mb-6">今の状態に近いものを選んでください</p>
            <div className="flex flex-col gap-3 mb-8">
              {(
                [
                  { emoji: '🔥', label: 'ペコペコ', value: 10 },
                  { emoji: '😋', label: 'けっこう空いてる', value: 8 },
                  { emoji: '😊', label: '普通', value: 5 },
                  { emoji: '🤏', label: '軽めがいい', value: 3 },
                  { emoji: '😌', label: 'ほぼ食べたくない', value: 1 },
                ] as const
              ).map(({ emoji, label, value }) => (
                <SelectCard
                  key={value}
                  emoji={emoji}
                  label={label}
                  selected={hungerLevel === value}
                  onClick={() => setHungerLevel(value)}
                />
              ))}
            </div>
            <Button onClick={handleNext} disabled={hungerLevel === null}>
              次へ
            </Button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">食べる場所は？</h1>
            <p className="text-sm text-[#6B7280] mb-6">希望があれば選んでください</p>
            <div className="flex flex-col gap-3 mb-4">
              <SelectCard
                emoji="🍽️"
                label="お店で食べる"
                selected={place === 'dine-in'}
                onClick={() => setPlace('dine-in')}
              />
              <SelectCard
                emoji="🥡"
                label="テイクアウト"
                selected={place === 'takeout'}
                onClick={() => setPlace('takeout')}
              />
              <SelectCard
                emoji="🙆"
                label="どちらでも"
                selected={place === null && place !== undefined}
                onClick={() => setPlace(null)}
              />
            </div>
            <div className="mb-8 text-right">
              <button
                type="button"
                onClick={() => {
                  setPlace(null);
                  handleNext();
                }}
                className="text-[#6B7280] text-sm hover:text-[#1A1A1A]"
              >
                スキップ →
              </button>
            </div>
            <Button onClick={handleNext} disabled={place === undefined}>
              次へ
            </Button>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">予算はどのくらい？</h1>
            <p className="text-sm text-[#6B7280] mb-6">一人あたりの目安を選んでください</p>
            <div className="flex flex-col gap-3 mb-8">
              <SelectCard
                emoji="💰"
                label="〜1,000円"
                selected={budget === '~1000'}
                onClick={() => setBudget('~1000')}
              />
              <SelectCard
                emoji="💰💰"
                label="1,000〜1,500円"
                selected={budget === '1000~1500'}
                onClick={() => setBudget('1000~1500')}
              />
              <SelectCard
                emoji="💰💰💰"
                label="1,500円〜"
                selected={budget === '1500~'}
                onClick={() => setBudget('1500~')}
              />
              <SelectCard
                emoji="🙆"
                label="こだわりなし"
                selected={budget === 'any'}
                onClick={() => setBudget('any')}
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <Button onClick={handleSubmit} disabled={budget === null || submitting}>
              {submitting ? '送信中...' : '送信する'}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
