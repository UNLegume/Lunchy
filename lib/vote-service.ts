import { setSession } from '@/lib/kv';
import { getSession } from '@/lib/session-service';
import { AppError } from '@/lib/errors';
import type { Session } from '@/lib/types';

export async function castVote(
  sessionId: string,
  memberId: string,
  candidateId: string,
): Promise<Session> {
  const session = await getSession(sessionId);

  if (session.status !== 'voting') {
    throw new AppError('INVALID_STATUS', '投票フェーズではありません', 400);
  }

  const memberExists = session.members.some((m) => m.id === memberId);
  if (!memberExists) {
    throw new AppError('MEMBER_NOT_FOUND', 'メンバーが見つかりません', 404);
  }

  const candidateExists = session.candidates.some((c) => c.id === candidateId);
  if (!candidateExists) {
    throw new AppError('CANDIDATE_NOT_FOUND', '候補が見つかりません', 404);
  }

  const alreadyVoted = session.votes.some((v) => v.memberId === memberId);
  if (alreadyVoted) {
    throw new AppError('ALREADY_VOTED', 'すでに投票済みです', 400);
  }

  const updatedVotes = [...session.votes, { memberId, candidateId }];
  let updatedSession: Session = { ...session, votes: updatedVotes };

  const allVoted = updatedVotes.length === session.members.length;
  if (allVoted) {
    updatedSession = checkMajority(updatedSession);
  }

  await setSession(sessionId, updatedSession);
  return updatedSession;
}

export function checkMajority(session: Session): Session {
  const majorityThreshold = session.members.length / 2;
  const tally = new Map<string, number>();

  for (const vote of session.votes) {
    tally.set(vote.candidateId, (tally.get(vote.candidateId) ?? 0) + 1);
  }

  for (const [candidateId, count] of tally) {
    if (count > majorityThreshold) {
      const winner = session.candidates.find((c) => c.id === candidateId) ?? null;
      return { ...session, status: 'decided', result: winner };
    }
  }

  return { ...session, status: 'runoff', result: null };
}

export async function castRunoffVote(
  sessionId: string,
  memberId: string,
  candidateId: string,
): Promise<Session> {
  const session = await getSession(sessionId);

  if (session.status !== 'runoff') {
    throw new AppError('INVALID_STATUS', '決選投票フェーズではありません', 400);
  }

  const memberExists = session.members.some((m) => m.id === memberId);
  if (!memberExists) {
    throw new AppError('MEMBER_NOT_FOUND', 'メンバーが見つかりません', 404);
  }

  const candidateExists = session.candidates.some((c) => c.id === candidateId);
  if (!candidateExists) {
    throw new AppError('CANDIDATE_NOT_FOUND', '候補が見つかりません', 404);
  }

  const alreadyVoted = session.runoffVotes.some((v) => v.memberId === memberId);
  if (alreadyVoted) {
    throw new AppError('ALREADY_VOTED', 'すでに投票済みです', 400);
  }

  const updatedRunoffVotes = [...session.runoffVotes, { memberId, candidateId }];
  let updatedSession: Session = { ...session, runoffVotes: updatedRunoffVotes };

  const allVoted = updatedRunoffVotes.length === session.members.length;
  if (allVoted) {
    updatedSession = checkRunoffResult(updatedSession);
  }

  await setSession(sessionId, updatedSession);
  return updatedSession;
}

export function checkRunoffResult(session: Session): Session {
  const tally = new Map<string, number>();

  for (const vote of session.runoffVotes) {
    tally.set(vote.candidateId, (tally.get(vote.candidateId) ?? 0) + 1);
  }

  const majorityThreshold = session.members.length / 2;

  for (const [candidateId, count] of tally) {
    if (count > majorityThreshold) {
      const winner = session.candidates.find((c) => c.id === candidateId) ?? null;
      return { ...session, status: 'decided', result: winner };
    }
  }

  // 同数の場合はランダム決定
  const candidateIds = Array.from(tally.keys());
  const randomId = candidateIds[Math.floor(Math.random() * candidateIds.length)];
  const winner = session.candidates.find((c) => c.id === randomId) ?? null;
  return { ...session, status: 'decided', result: winner };
}
