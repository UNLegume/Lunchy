import { SessionCreatedPage } from '@/src/views/session-created';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <SessionCreatedPage sessionId={id} />;
}
