import { NextRequest, NextResponse } from 'next/server';
import { submitPreferences } from '@/lib/session-service';
import { preferencesSchema } from '@/lib/validation';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = preferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'バリデーションエラー', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const { memberId, ...preference } = parsed.data;
    const session = await submitPreferences(id, memberId, preference);

    return NextResponse.json({ session }, { status: 200 });
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
