import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/sessions/route';
import * as sessionService from '@/lib/session-service';
import type { Session } from '@/lib/types';

vi.mock('@/lib/session-service');

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/sessions', () => {
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

  it('正常系: セッション作成成功 → 201', async () => {
    vi.mocked(sessionService.createSession).mockResolvedValue(mockSession);

    const req = makeRequest({ displayName: '山田太郎', location: '渋谷駅' });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual({ session: mockSession });
    expect(sessionService.createSession).toHaveBeenCalledWith('山田太郎', '渋谷駅');
  });

  it('バリデーションエラー: displayName なし → 400', async () => {
    const req = makeRequest({ location: '渋谷駅' });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('バリデーションエラー: location なし → 400', async () => {
    const req = makeRequest({ displayName: '山田太郎' });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
