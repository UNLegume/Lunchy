import { getSession as kvGetSession, setSession } from '@/lib/kv';
import type { Member, Session } from '@/lib/types';
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

export async function joinSession(
  sessionId: string,
  displayName: string,
): Promise<{ session: Session; member: Member }> {
  const session = await getSession(sessionId);

  if (session.status !== 'gathering') {
    throw new AppError('SESSION_CLOSED', 'このセッションは締め切られています', 400);
  }

  const member: Member = {
    id: crypto.randomUUID(),
    displayName,
    isOrganizer: false,
  };

  const updatedSession: Session = {
    ...session,
    members: [...session.members, member],
  };

  await setSession(sessionId, updatedSession);

  return { session: updatedSession, member };
}

export async function getSession(id: string): Promise<Session> {
  const session = await kvGetSession(id);
  if (!session) {
    throw new AppError('SESSION_NOT_FOUND', 'セッションが見つかりません', 404);
  }
  return session;
}
