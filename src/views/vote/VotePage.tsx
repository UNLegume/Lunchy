'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VotePanel, RunoffPanel } from '@/src/features/cast-vote';
import { Spinner } from '@/src/shared/ui';
import type { Session } from '@/lib/types';

export function VotePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [memberId] = useState<string>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem(`lunchy_member_${sessionId}`) ?? '') : '',
  );
  const [fetchError, setFetchError] = useState<string | null>(null);

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
    if (session.status === 'decided') {
      router.push(`/session/${sessionId}/result`);
    }
  }, [session, sessionId, router]);

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

  const voteCount = session.votes.length;
  const memberCount = session.members.length;

  return (
    <main className="min-h-screen bg-[#F3F4F6] px-4 py-8">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <h1 className="text-lg font-bold text-[#1A1A1A]">🍽️ Lunchy</h1>

        <div className="bg-blue-50 rounded-xl px-4 py-3 text-center">
          <p className="text-sm text-blue-700 font-medium">
            {voteCount} / {memberCount} 人投票済み
          </p>
        </div>

        {session.status === 'voting' && (
          <VotePanel
            sessionId={sessionId}
            candidates={session.candidates}
            members={session.members}
            votes={session.votes}
            memberId={memberId}
          />
        )}

        {session.status === 'runoff' && (
          <RunoffPanel
            sessionId={sessionId}
            candidates={session.candidates}
            memberId={memberId}
            votes={session.votes}
            runoffVotes={session.runoffVotes}
            members={session.members}
          />
        )}
      </div>
    </main>
  );
}
