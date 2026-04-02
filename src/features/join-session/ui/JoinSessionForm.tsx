'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { apiPost } from '@/src/shared/api/client';
import type { Session, Member } from '@/lib/types';

type JoinSessionFormProps = {
  sessionId: string;
  organizerName: string;
};

type JoinResponse = {
  session: Session;
  member: Member;
};

export function JoinSessionForm({ sessionId, organizerName }: JoinSessionFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('表示名を入力してください');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const data = await apiPost<JoinResponse>(`/api/sessions/${sessionId}/join`, {
        displayName: displayName.trim(),
      });
      localStorage.setItem(`lunchy_member_${sessionId}`, data.member.id);
      router.push(`/session/${sessionId}/preferences`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#F3F4F6]">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#1A1A1A]">🍽️ Lunchy</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            {organizerName}さんのランチセッション
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="表示名"
              placeholder="例: 山田"
              value={displayName}
              onChange={setDisplayName}
              error={error}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '参加中...' : '参加する'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
