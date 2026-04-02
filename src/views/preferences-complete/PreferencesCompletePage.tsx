'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/src/shared/ui';
import { apiGet } from '@/src/shared/api/client';
import type { Session } from '@/lib/types';

export function PreferencesCompletePage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const memberId = localStorage.getItem(`lunchy_member_${sessionId}`);
    if (!memberId || !sessionId) return;

    void apiGet<{ session: Session }>(`/api/sessions/${sessionId}`)
      .then((data) => {
        setIsOrganizer(data.session.organizerId === memberId);
      })
      .catch(() => {
        // セッション取得失敗時は幹事リンクを非表示のままにする
      });
  }, [sessionId]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F3F4F6] px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center flex flex-col gap-4">
        <p className="text-4xl">✅</p>
        <h1 className="text-xl font-bold text-[#1A1A1A]">回答完了！</h1>
        <p className="text-[#6B7280] text-base">幹事が締め切るまでお待ちください</p>
        {isOrganizer && (
          <Link href={`/session/${sessionId}/dashboard`}>
            <Button>ダッシュボードへ</Button>
          </Link>
        )}
      </div>
    </main>
  );
}
