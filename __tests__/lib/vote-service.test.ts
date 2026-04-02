import { describe, it, expect, vi, beforeEach } from 'vitest';
import { castVote, checkMajority, castRunoffVote, checkRunoffResult } from '@/lib/vote-service';
import * as kv from '@/lib/kv';
import { AppError } from '@/lib/errors';
import type { Session, Candidate } from '@/lib/types';

vi.mock('@/lib/kv');

const makeCandidate = (id: string): Candidate => ({
  id,
  name: `店舗${id}`,
  genre: 'ランチ',
  walkMinutes: 5,
  rating: 4.0,
  priceRange: '~1000',
  photoUrl: '',
});

const baseSession: Session = {
  id: 'session-id',
  organizerId: 'organizer-id',
  location: '渋谷駅',
  status: 'voting',
  members: [
    { id: 'member-1', displayName: 'Alice', isOrganizer: true },
    { id: 'member-2', displayName: 'Bob', isOrganizer: false },
    { id: 'member-3', displayName: 'Carol', isOrganizer: false },
  ],
  preferences: [],
  candidates: [makeCandidate('cand-A'), makeCandidate('cand-B'), makeCandidate('cand-C')],
  votes: [],
  runoffVotes: [],
  result: null,
  createdAt: new Date().toISOString(),
};

describe('castVote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(kv.setSession).mockResolvedValue(undefined);
  });

  it('正常に投票できる', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({ ...baseSession });

    const result = await castVote('session-id', 'member-1', 'cand-A');

    expect(result.votes).toHaveLength(1);
    expect(result.votes[0]).toEqual({ memberId: 'member-1', candidateId: 'cand-A' });
    expect(kv.setSession).toHaveBeenCalledWith(
      'session-id',
      expect.objectContaining({
        votes: [{ memberId: 'member-1', candidateId: 'cand-A' }],
      }),
    );
  });

  it('重複投票でエラー', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({
      ...baseSession,
      votes: [{ memberId: 'member-1', candidateId: 'cand-A' }],
    });

    await expect(castVote('session-id', 'member-1', 'cand-B')).rejects.toThrow(AppError);
    await expect(castVote('session-id', 'member-1', 'cand-B')).rejects.toMatchObject({
      code: 'ALREADY_VOTED',
      statusCode: 400,
    });
  });

  it('voting 以外のステータスでエラー', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({ ...baseSession, status: 'gathering' });

    await expect(castVote('session-id', 'member-1', 'cand-A')).rejects.toThrow(AppError);
    await expect(castVote('session-id', 'member-1', 'cand-A')).rejects.toMatchObject({
      code: 'INVALID_STATUS',
      statusCode: 400,
    });
  });

  it('存在しないメンバーでエラー', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({ ...baseSession });

    await expect(castVote('session-id', 'nonexistent-member', 'cand-A')).rejects.toThrow(AppError);
    await expect(castVote('session-id', 'nonexistent-member', 'cand-A')).rejects.toMatchObject({
      code: 'MEMBER_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('存在しない候補でエラー', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({ ...baseSession });

    await expect(castVote('session-id', 'member-1', 'nonexistent-cand')).rejects.toThrow(AppError);
    await expect(castVote('session-id', 'member-1', 'nonexistent-cand')).rejects.toMatchObject({
      code: 'CANDIDATE_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('全員投票済みで checkMajority が呼ばれ status が更新される（過半数あり）', async () => {
    // member-1, member-2 はすでに cand-A に投票済み → member-3 が cand-A に投票すると過半数
    vi.mocked(kv.getSession).mockResolvedValue({
      ...baseSession,
      votes: [
        { memberId: 'member-1', candidateId: 'cand-A' },
        { memberId: 'member-2', candidateId: 'cand-A' },
      ],
    });

    const result = await castVote('session-id', 'member-3', 'cand-A');

    expect(result.status).toBe('decided');
    expect(result.result).toEqual(makeCandidate('cand-A'));
  });

  it('全員投票済みで過半数なしなら runoff になる', async () => {
    // member-1→cand-A, member-2→cand-B があり、member-3→cand-C で全員投票完了
    vi.mocked(kv.getSession).mockResolvedValue({
      ...baseSession,
      votes: [
        { memberId: 'member-1', candidateId: 'cand-A' },
        { memberId: 'member-2', candidateId: 'cand-B' },
      ],
    });

    const result = await castVote('session-id', 'member-3', 'cand-C');

    expect(result.status).toBe('runoff');
    expect(result.result).toBeNull();
  });
});

describe('checkMajority', () => {
  it('過半数あり → decided', () => {
    const session: Session = {
      ...baseSession,
      votes: [
        { memberId: 'member-1', candidateId: 'cand-A' },
        { memberId: 'member-2', candidateId: 'cand-A' },
        { memberId: 'member-3', candidateId: 'cand-B' },
      ],
    };

    const result = checkMajority(session);

    expect(result.status).toBe('decided');
    expect(result.result).toEqual(makeCandidate('cand-A'));
  });

  it('過半数なし → runoff', () => {
    const session: Session = {
      ...baseSession,
      votes: [
        { memberId: 'member-1', candidateId: 'cand-A' },
        { memberId: 'member-2', candidateId: 'cand-B' },
        { memberId: 'member-3', candidateId: 'cand-C' },
      ],
    };

    const result = checkMajority(session);

    expect(result.status).toBe('runoff');
    expect(result.result).toBeNull();
  });
});

describe('castRunoffVote', () => {
  const runoffSession: Session = {
    ...baseSession,
    status: 'runoff',
    votes: [
      { memberId: 'member-1', candidateId: 'cand-A' },
      { memberId: 'member-2', candidateId: 'cand-B' },
      { memberId: 'member-3', candidateId: 'cand-C' },
    ],
    runoffVotes: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(kv.setSession).mockResolvedValue(undefined);
  });

  it('正常に投票できる', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({ ...runoffSession });

    const result = await castRunoffVote('session-id', 'member-1', 'cand-A');

    expect(result.runoffVotes).toHaveLength(1);
    expect(result.runoffVotes[0]).toEqual({ memberId: 'member-1', candidateId: 'cand-A' });
  });

  it('重複投票でエラー', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({
      ...runoffSession,
      runoffVotes: [{ memberId: 'member-1', candidateId: 'cand-A' }],
    });

    await expect(castRunoffVote('session-id', 'member-1', 'cand-B')).rejects.toThrow(AppError);
    await expect(castRunoffVote('session-id', 'member-1', 'cand-B')).rejects.toMatchObject({
      code: 'ALREADY_VOTED',
      statusCode: 400,
    });
  });

  it('runoff 以外のステータスでエラー', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({ ...baseSession, status: 'voting' });

    await expect(castRunoffVote('session-id', 'member-1', 'cand-A')).rejects.toThrow(AppError);
    await expect(castRunoffVote('session-id', 'member-1', 'cand-A')).rejects.toMatchObject({
      code: 'INVALID_STATUS',
      statusCode: 400,
    });
  });
});

describe('checkRunoffResult', () => {
  it('過半数で決定', () => {
    const session: Session = {
      ...baseSession,
      status: 'runoff',
      runoffVotes: [
        { memberId: 'member-1', candidateId: 'cand-A' },
        { memberId: 'member-2', candidateId: 'cand-A' },
        { memberId: 'member-3', candidateId: 'cand-B' },
      ],
    };

    const result = checkRunoffResult(session);

    expect(result.status).toBe('decided');
    expect(result.result).toEqual(makeCandidate('cand-A'));
  });

  it('同数でランダム決定 → どちらかの候補が result になる', () => {
    const session: Session = {
      ...baseSession,
      members: [
        { id: 'member-1', displayName: 'Alice', isOrganizer: true },
        { id: 'member-2', displayName: 'Bob', isOrganizer: false },
      ],
      status: 'runoff',
      runoffVotes: [
        { memberId: 'member-1', candidateId: 'cand-A' },
        { memberId: 'member-2', candidateId: 'cand-B' },
      ],
    };

    const result = checkRunoffResult(session);

    expect(result.status).toBe('decided');
    expect(result.result).not.toBeNull();
    const validIds = ['cand-A', 'cand-B'];
    expect(validIds).toContain(result.result?.id);
  });
});
