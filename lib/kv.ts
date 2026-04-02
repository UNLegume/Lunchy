import { kv } from '@vercel/kv';
import type { Session } from '@/lib/types';

const sessionKey = (id: string) => `session:${id}`;

export async function getSession(id: string): Promise<Session | null> {
  return kv.get<Session>(sessionKey(id));
}

export async function setSession(id: string, session: Session): Promise<void> {
  await kv.set(sessionKey(id), session, { ex: 86400 });
}

export async function deleteSession(id: string): Promise<void> {
  await kv.del(sessionKey(id));
}
