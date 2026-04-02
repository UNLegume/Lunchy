import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/kv';
import { generateCandidates } from '@/lib/gemini';
import { AppError } from '@/lib/errors';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  try {
    const candidates = await generateCandidates(session.location, session.preferences);

    const updatedSession = {
      ...session,
      candidates,
      status: 'voting' as const,
    };

    await setSession(sessionId, updatedSession);

    return NextResponse.json({ candidates });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
