import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lunchy',
  description: 'チームのランチ、みんなで決めよう',
  openGraph: {
    title: 'Lunchy',
    description: 'チームのランチ、みんなで決めよう。AIが提案、みんなで投票。',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
