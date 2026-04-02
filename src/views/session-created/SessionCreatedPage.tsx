'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/src/shared/ui';
import { Button } from '@/src/shared/ui';
import { CopyUrlButton } from '@/src/features/share-url';

type SessionCreatedPageProps = {
  sessionId: string;
};

export function SessionCreatedPage({ sessionId }: SessionCreatedPageProps) {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(`${window.location.origin}/session/${sessionId}/join`);
  }, [sessionId]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="text-center">
          <p className="text-4xl mb-2">✅</p>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">セッションを作成しました！</h1>
          <p className="text-[#6B7280] mt-1">以下のURLをチームメンバーに共有してください</p>
        </div>

        <Card className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-[#6B7280]">参加URL</p>
          <p className="text-sm text-[#1A1A1A] bg-[#F3F4F6] rounded-lg px-3 py-3 break-all">
            {shareUrl}
          </p>
          {shareUrl && <CopyUrlButton url={shareUrl} />}
        </Card>

        <Link href={`/session/${sessionId}/preferences`}>
          <Button>好みを入力する →</Button>
        </Link>
      </div>
    </main>
  );
}
