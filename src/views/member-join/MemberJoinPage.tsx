'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { JoinSessionForm } from '@/src/features/join-session';
import { ErrorScreen, Spinner } from '@/src/shared/ui';
import { apiGet } from '@/src/shared/api/client';
import type { Session } from '@/lib/types';

type SessionResponse = {
  session: Session;
};

export function MemberJoinPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'not_found' | 'closed'>('loading');

  useEffect(() => {
    if (!sessionId) return;

    apiGet<SessionResponse>(`/api/sessions/${sessionId}`)
      .then(({ session: s }) => {
        setSession(s);
        if (s.status !== 'gathering') {
          setStatus('closed');
        } else {
          setStatus('found');
        }
      })
      .catch(() => {
        setStatus('not_found');
      });
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#F3F4F6]">
        <Spinner text="読み込み中..." />
      </main>
    );
  }

  if (status === 'not_found') {
    return <ErrorScreen message="セッションが見つかりませんでした" />;
  }

  if (status === 'closed') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#F3F4F6]">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-[#1A1A1A] text-base font-medium">このセッションは締め切られました</p>
        </div>
      </main>
    );
  }

  const organizer = session!.members.find((m) => m.isOrganizer);
  const organizerName = organizer?.displayName ?? '';

  return <JoinSessionForm sessionId={sessionId} organizerName={organizerName} />;
}
