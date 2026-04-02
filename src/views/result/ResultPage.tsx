'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ErrorScreen } from '@/src/shared/ui';
import type { Candidate } from '@/lib/types';
import { WinnerCard } from './WinnerCard';

type ResultResponse = {
  result: Candidate;
  sessionId: string;
  totalMembers: number;
  status: string;
};

export function ResultPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [data, setData] = useState<ResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/result`);
        if (!res.ok) {
          const json = (await res.json()) as { error?: { message?: string } };
          setError(json.error?.message ?? 'エラーが発生しました');
          return;
        }
        const json = (await res.json()) as ResultResponse;
        setData(json);
      } catch {
        setError('結果の取得に失敗しました');
      }
    }

    void fetchResult();
  }, [sessionId]);

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!data) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#F3F4F6] px-4">
        <p className="text-[#6B7280]">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3F4F6] px-4 py-8">
      <div className="max-w-md mx-auto flex flex-col items-center gap-6">
        <h1 className="text-lg font-bold text-[#1A1A1A] self-start">🍽️ Lunchy</h1>

        <span className="text-6xl">🎉</span>
        <p className="text-xl font-bold text-[#1A1A1A] text-center">ランチが決まりました！</p>

        <WinnerCard candidate={data.result} />

        <Link href="/" className="text-sm text-[#6B7280] underline mt-2">
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
