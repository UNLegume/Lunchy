import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lunchy',
  description: 'チームのランチ、みんなで決めよう',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="bg-[#F3F4F6] min-h-screen">{children}</body>
    </html>
  );
}
