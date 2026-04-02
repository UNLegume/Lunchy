import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/sessions/[id]/result/route';
import * as sessionService from '@/lib/session-service';
import { AppError } from '@/lib/errors';
import type { Session } from '@/lib/types';

vi.mock('@/lib/session-service');

function makeRequest(id: string) {
  return new Request(`http://localhost/api/sessions/${id}/result`);
}

describe('GET /api/sessions/[id]/result', () => {
  const mockCandidate = {
    id: 'cand-A',
    name: '焼肉ランチ',
    genre: '焼肉',
    walkMinutes: 5,
    rating: 4.2,
    priceRange: '~1500',
    photoUrl: '',
  };

  const mockDecidedSession: Session = {
    id: 'session-uuid',
    organizerId: 'organizer-uuid',
    location: '渋谷駅',
    status: 'decided',
    members: [
      { id: 'member-1', displayName: '山田太郎', isOrganizer: true },
      { id: 'member-2', displayName: '鈴木花子', isOrganizer: false },
      { id: 'member-3', displayName: '佐藤次郎', isOrganizer: false },
      { id: 'member-4', displayName: '田中美咲', isOrganizer: false },
      { id: 'member-5', displayName: '木村健一', isOrganizer: false },
    ],
    preferences: [],
    candidates: [mockCandidate],
    votes: [],
    runoffVotes: [],
    result: mockCandidate,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: decided ステータスで result を返す → 200', async () => {
    vi.mocked(sessionService.getSession).mockResolvedValue(mockDecidedSession);

    const req = makeRequest('session-uuid');
    const res = await GET(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.result).toEqual(mockCandidate);
    expect(data.sessionId).toBe('session-uuid');
    expect(data.totalMembers).toBe(5);
    expect(data.status).toBe('decided');
    expect(data.votes).toBeUndefined();
  });

  it('セッション不存在 → 404', async () => {
    vi.mocked(sessionService.getSession).mockRejectedValue(
      new AppError('SESSION_NOT_FOUND', 'セッションが見つかりません', 404),
    );

    const req = makeRequest('nonexistent-id');
    const res = await GET(req as never, {
      params: Promise.resolve({ id: 'nonexistent-id' }),
    });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });

  it('decided 以外のステータス（voting）→ 400', async () => {
    const votingSession: Session = {
      ...mockDecidedSession,
      status: 'voting',
      result: null,
    };
    vi.mocked(sessionService.getSession).mockResolvedValue(votingSession);

    const req = makeRequest('session-uuid');
    const res = await GET(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('NOT_DECIDED');
  });

  it('decided ステータスだが result が null → 400', async () => {
    const noResultSession: Session = {
      ...mockDecidedSession,
      status: 'decided',
      result: null,
    };
    vi.mocked(sessionService.getSession).mockResolvedValue(noResultSession);

    const req = makeRequest('session-uuid');
    const res = await GET(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('NOT_DECIDED');
  });
});
