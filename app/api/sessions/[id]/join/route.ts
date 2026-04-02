import { NextRequest, NextResponse } from 'next/server';
import { joinSession } from '@/lib/session-service';
import { joinSessionSchema } from '@/lib/validation';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = joinSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'バリデーションエラー', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const { displayName } = parsed.data;
    const result = await joinSession(id, displayName);

    return NextResponse.json(result, { status: 200 });
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
