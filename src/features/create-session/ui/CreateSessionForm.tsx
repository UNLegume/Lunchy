'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { apiPost } from '@/src/shared/api';
import type { Session } from '@/lib/types';

type CreateSessionResponse = { session: Session };

export function CreateSessionForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    let valid = true;
    if (!displayName.trim()) {
      setDisplayNameError('表示名を入力してください');
      valid = false;
    } else if (displayName.length > 20) {
      setDisplayNameError('20文字以内で入力してください');
      valid = false;
    } else {
      setDisplayNameError('');
    }
    if (!location.trim()) {
      setLocationError('場所を入力してください');
      valid = false;
    } else {
      setLocationError('');
    }
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await apiPost<CreateSessionResponse>('/api/sessions', {
        displayName: displayName.trim(),
        location: location.trim(),
      });
      const sessionId = data.session.id;
      localStorage.setItem(`lunchy_member_${sessionId}`, data.session.organizerId);
      router.push(`/session/${sessionId}/created`);
    } catch {
      setLocationError('セッションの作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="あなたの表示名"
          placeholder="例: 山田太郎"
          hint="1〜20文字で入力してください"
          value={displayName}
          onChange={setDisplayName}
          error={displayNameError}
        />
        <Input
          label="ランチ場所（最寄り駅・エリア）"
          placeholder="例: 渋谷駅"
          value={location}
          onChange={setLocation}
          error={locationError}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '作成中...' : 'セッションを作成する'}
        </Button>
      </form>
    </Card>
  );
}
