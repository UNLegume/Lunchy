import { NextRequest, NextResponse } from 'next/server';
import { createSessionSchema } from '@/lib/validation';
import { createSession } from '@/lib/session-service';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'バリデーションエラー', details: parsed.error.issues } },
        { status: 400 },
      );
    }
    const session = await createSession(parsed.data.displayName, parsed.data.location);
    return NextResponse.json({ session }, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: { message: err.message, code: err.code } },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { error: { message: 'サーバーエラーが発生しました' } },
      { status: 500 },
    );
  }
}
