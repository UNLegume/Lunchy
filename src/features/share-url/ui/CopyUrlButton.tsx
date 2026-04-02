'use client';

import { useState } from 'react';
import { Button } from '@/src/shared/ui';

type CopyUrlButtonProps = {
  url: string;
};

export function CopyUrlButton({ url }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="secondary" onClick={handleCopy}>
      {copied ? 'コピーしました！' : 'URLをコピー'}
    </Button>
  );
}
