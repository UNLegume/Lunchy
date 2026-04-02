'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Spinner } from '@/src/shared/ui';
import type { Session } from '@/lib/types';

export function PreferencesCompletePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [isOrganizer, setIsOrganizer] = useState(false);
  const statusText = '幹事が締め切るまでお待ちください';

  useEffect(() => {
    const memberId =
      typeof window !== 'undefined'
        ? (localStorage.getItem(`lunchy_member_${sessionId}`) ?? '')
        : '';
    if (!memberId || !sessionId) return;

    let cancelled = false;

    async function pollSession() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (!res.ok) return;
        const data = (await res.json()) as { session: Session };
        if (cancelled) return;

        setIsOrganizer(data.session.organizerId === memberId);

        if (data.session.status === 'voting' || data.session.status === 'runoff') {
          router.push(`/session/${sessionId}/vote`);
        } else if (data.session.status === 'decided') {
          router.push(`/session/${sessionId}/result`);
        }
      } catch {
        // ポーリング失敗は無視
      }
    }

    void pollSession();
    const interval = setInterval(() => {
      void pollSession();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center flex flex-col items-center gap-4">
        <p className="text-4xl">✅</p>
        <h1 className="text-xl font-bold text-[#1A1A1A]">回答完了！</h1>
        <p className="text-[#6B7280] text-base">{statusText}</p>
        <Spinner />
        {isOrganizer && (
          <Link href={`/session/${sessionId}/dashboard`}>
            <Button>ダッシュボードへ</Button>
          </Link>
        )}
      </div>
    </main>
  );
}
