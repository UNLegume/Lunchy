import { NextRequest, NextResponse } from 'next/server';
import { voteWithMemberSchema } from '@/lib/validation';
import { castRunoffVote } from '@/lib/vote-service';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const parsed = voteWithMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'バリデーションエラー', details: parsed.error.issues } },
        { status: 400 },
      );
    }
    const session = await castRunoffVote(sessionId, parsed.data.memberId, parsed.data.candidateId);
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
