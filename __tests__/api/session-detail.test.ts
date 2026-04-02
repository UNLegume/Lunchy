import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/sessions/[id]/route';
import * as sessionService from '@/lib/session-service';
import { AppError } from '@/lib/errors';
import type { Session } from '@/lib/types';

vi.mock('@/lib/session-service');

function makeRequest(id: string) {
  return new Request(`http://localhost/api/sessions/${id}`);
}

describe('GET /api/sessions/[id]', () => {
  const mockSession: Session = {
    id: 'session-uuid',
    organizerId: 'organizer-uuid',
    location: '渋谷駅',
    status: 'gathering',
    members: [{ id: 'organizer-uuid', displayName: '山田太郎', isOrganizer: true }],
    preferences: [],
    candidates: [],
    votes: [],
    runoffVotes: [],
    result: null,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: セッション取得成功 → 200', async () => {
    vi.mocked(sessionService.getSession).mockResolvedValue(mockSession);

    const req = makeRequest('session-uuid');
    const res = await GET(req as never, { params: Promise.resolve({ id: 'session-uuid' }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ session: mockSession });
    expect(sessionService.getSession).toHaveBeenCalledWith('session-uuid');
  });

  it('セッション不存在 → 404', async () => {
    vi.mocked(sessionService.getSession).mockRejectedValue(
      new AppError('SESSION_NOT_FOUND', 'セッションが見つかりません', 404),
    );

    const req = makeRequest('nonexistent-id');
    const res = await GET(req as never, { params: Promise.resolve({ id: 'nonexistent-id' }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });
});
