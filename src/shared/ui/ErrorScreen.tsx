'use client';

import Link from 'next/link';
import { Button } from './Button';

type ErrorScreenProps = {
  message: string;
};

export function ErrorScreen({ message }: ErrorScreenProps) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#F3F4F6]">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 flex flex-col items-center gap-6 text-center">
        <span className="text-5xl">⚠️</span>
        <p className="text-[#1A1A1A] text-base font-medium">{message}</p>
        <Link href="/" className="w-full">
          <Button>トップページへ戻る</Button>
        </Link>
      </div>
    </main>
  );
}
