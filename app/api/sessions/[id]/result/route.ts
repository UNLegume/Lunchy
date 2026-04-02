import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session-service';
import { AppError } from '@/lib/errors';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const session = await getSession(sessionId);

    if (session.status !== 'decided' || !session.result) {
      throw new AppError('NOT_DECIDED', 'まだ結果が出ていません', 400);
    }

    return NextResponse.json(
      {
        result: session.result,
        sessionId: session.id,
        totalMembers: session.members.length,
        status: session.status,
      },
      { status: 200 },
    );
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
