'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, ProgressBar, Spinner } from '@/src/shared/ui';
import { apiPost } from '@/src/shared/api/client';
import type { Session } from '@/lib/types';

type CloseResponse = { session: Session };

export function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [memberId] = useState<string>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem(`lunchy_member_${sessionId}`) ?? '') : '',
  );
  const [isClosing, setIsClosing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSession() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (!res.ok) {
          setFetchError('セッション情報の取得に失敗しました');
          return;
        }
        const data = (await res.json()) as { session: Session };
        if (!cancelled) {
          setSession(data.session);
        }
      } catch {
        if (!cancelled) {
          setFetchError('セッション情報の取得に失敗しました');
        }
      }
    }

    void fetchSession();
    const interval = setInterval(() => {
      void fetchSession();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    if (session.status === 'voting') {
      router.push(`/session/${sessionId}/vote`);
    } else if (session.status === 'decided') {
      router.push(`/session/${sessionId}/result`);
    }
  }, [session, sessionId, router]);

  async function handleClose() {
    if (!session) return;

    const hasUnanswered = session.members.some(
      (m) => !session.preferences.some((p) => p.memberId === m.id),
    );

    if (hasUnanswered) {
      const confirmed = window.confirm('まだ未回答のメンバーがいますが、締め切りますか？');
      if (!confirmed) return;
    }

    setIsClosing(true);
    setCloseError(null);

    try {
      const data = await apiPost<CloseResponse>(`/api/sessions/${sessionId}/close`, {
        organizerId: memberId,
      });
      setSession(data.session);
    } catch (e) {
      setCloseError(e instanceof Error ? e.message : '締め切りに失敗しました');
      setIsClosing(false);
    }
  }

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#F3F4F6] px-4">
        {fetchError ? (
          <p className="text-red-500">{fetchError}</p>
        ) : (
          <Spinner text="読み込み中..." />
        )}
      </main>
    );
  }

  const answeredCount = session.members.filter((m) =>
    session.preferences.some((p) => p.memberId === m.id),
  ).length;
  const totalCount = session.members.length;
  const isOrganizer = memberId === session.organizerId;

  if (isClosing) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#F3F4F6] px-4">
        <Spinner text="お店を探しています..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3F4F6] px-4 py-8">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <h1 className="text-lg font-bold text-[#1A1A1A]">🍽️ Lunchy</h1>

        <Card>
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">回答状況</h2>
          <ProgressBar current={answeredCount} total={totalCount} />
          <p className="text-sm text-[#6B7280] mt-2 mb-4">
            {answeredCount} / {totalCount} 人が回答済み
          </p>
          <ul className="flex flex-col gap-2">
            {session.members.map((member) => {
              const answered = session.preferences.some((p) => p.memberId === member.id);
              return (
                <li key={member.id} className="flex items-center gap-2 text-sm text-[#1A1A1A]">
                  <span>{answered ? '✅' : '⏳'}</span>
                  <span>{member.displayName}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        {closeError && <p className="text-red-500 text-sm text-center">{closeError}</p>}

        {isOrganizer && session.status === 'gathering' && (
          <Button onClick={() => void handleClose()}>入力を締め切る</Button>
        )}

        {!isOrganizer && (
          <Link href={`/session/${sessionId}/preferences`}>
            <Button variant="secondary">好みを入力する</Button>
          </Link>
        )}
      </div>
    </main>
  );
}
