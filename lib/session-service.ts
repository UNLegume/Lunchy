import { getSession as kvGetSession, setSession } from '@/lib/kv';
import type { Session } from '@/lib/types';
import { AppError } from '@/lib/errors';

export async function createSession(displayName: string, location: string): Promise<Session> {
  const id = crypto.randomUUID();
  const organizerId = crypto.randomUUID();

  const session: Session = {
    id,
    organizerId,
    location,
    status: 'gathering',
    members: [
      {
        id: organizerId,
        displayName,
        isOrganizer: true,
      },
    ],
    preferences: [],
    candidates: [],
    votes: [],
    runoffVotes: [],
    result: null,
    createdAt: new Date().toISOString(),
  };

  await setSession(id, session);
  return session;
}

export async function getSession(id: string): Promise<Session> {
  const session = await kvGetSession(id);
  if (!session) {
    throw new AppError('SESSION_NOT_FOUND', 'セッションが見つかりません', 404);
  }
  return session;
}
