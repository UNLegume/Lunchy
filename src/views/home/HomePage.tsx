import Link from 'next/link';
import { Button } from '@/src/shared/ui';

const steps = [
  { step: '1', label: '幹事がセッションを作成', icon: '🍽️' },
  { step: '2', label: 'メンバーが好みを入力', icon: '✅' },
  { step: '3', label: 'みんなで投票して決定！', icon: '🗳️' },
];

export function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="max-w-md w-full flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">🍽️ Lunchy</h1>
          <p className="text-lg text-[#6B7280] font-medium">チームのランチ、みんなで決めよう</p>
        </div>

        <div className="w-full bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">使い方</h2>
          <div className="flex flex-col gap-3">
            {steps.map(({ step, label, icon }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FF6B35] text-white text-sm font-bold flex items-center justify-center">
                  {step}
                </span>
                <span className="text-[#1A1A1A]">
                  {icon} {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <Link href="/session/create">
            <Button>ランチセッションを作る</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
