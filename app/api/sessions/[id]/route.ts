import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session-service';
import { AppError } from '@/lib/errors';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession(id);
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
