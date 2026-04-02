'use client';

import { useParams } from 'next/navigation';
import { PreferenceWizard } from '@/src/features/submit-preferences';

export function PreferencesPage() {
  const params = useParams();
  const sessionId = params.id as string;

  return <PreferenceWizard sessionId={sessionId} />;
}
