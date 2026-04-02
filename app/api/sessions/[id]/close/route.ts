import { NextRequest, NextResponse } from 'next/server';
import { closeSession } from '@/lib/session-service';
import { closeSessionSchema } from '@/lib/validation';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエストボディが不正です' }, { status: 400 });
  }

  const parsed = closeSessionSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'バリデーションエラー';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { organizerId } = parsed.data;

  try {
    const session = await closeSession(sessionId, organizerId);
    return NextResponse.json({ session }, { status: 200 });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
