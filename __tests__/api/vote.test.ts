import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/sessions/[id]/vote/route';
import * as voteService from '@/lib/vote-service';
import { AppError } from '@/lib/errors';
import type { Session } from '@/lib/types';

vi.mock('@/lib/vote-service');

function makeRequest(id: string, body: unknown) {
  return new Request(`http://localhost/api/sessions/${id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/sessions/[id]/vote', () => {
  const mockSession: Session = {
    id: 'session-uuid',
    organizerId: 'organizer-uuid',
    location: '渋谷駅',
    status: 'voting',
    members: [{ id: 'member-uuid', displayName: '山田太郎', isOrganizer: true }],
    preferences: [],
    candidates: [
      {
        id: 'cand-A',
        name: '店A',
        genre: 'ランチ',
        walkMinutes: 5,
        rating: 4.0,
        priceRange: '~1000',
        photoUrl: '',
      },
    ],
    votes: [{ memberId: 'member-uuid', candidateId: 'cand-A' }],
    runoffVotes: [],
    result: null,
    createdAt: new Date().toISOString(),
  };

  const validBody = {
    memberId: 'member-uuid',
    candidateId: 'cand-A',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系 → 200', async () => {
    vi.mocked(voteService.castVote).mockResolvedValue(mockSession);

    const req = makeRequest('session-uuid', validBody);
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ session: mockSession });
    expect(voteService.castVote).toHaveBeenCalledWith('session-uuid', 'member-uuid', 'cand-A');
  });

  it('バリデーションエラー: memberId なし → 400', async () => {
    const req = makeRequest('session-uuid', { candidateId: 'cand-A' });
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('バリデーションエラー: candidateId なし → 400', async () => {
    const req = makeRequest('session-uuid', { memberId: 'member-uuid' });
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('セッション不存在 → 404', async () => {
    vi.mocked(voteService.castVote).mockRejectedValue(
      new AppError('SESSION_NOT_FOUND', 'セッションが見つかりません', 404),
    );

    const req = makeRequest('nonexistent-id', validBody);
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'nonexistent-id' }),
    });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });
});
