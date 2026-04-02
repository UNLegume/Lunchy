import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/sessions/[id]/preferences/route';
import * as sessionService from '@/lib/session-service';
import { AppError } from '@/lib/errors';
import type { Session } from '@/lib/types';

vi.mock('@/lib/session-service');

function makeRequest(id: string, body: unknown) {
  return new Request(`http://localhost/api/sessions/${id}/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/sessions/[id]/preferences', () => {
  const mockSession: Session = {
    id: 'session-uuid',
    organizerId: 'organizer-uuid',
    location: '渋谷駅',
    status: 'gathering',
    members: [
      { id: 'organizer-uuid', displayName: '山田太郎', isOrganizer: true },
      { id: 'member-uuid', displayName: '鈴木花子', isOrganizer: false },
    ],
    preferences: [
      {
        memberId: 'member-uuid',
        allergy: ['卵'],
        category: 'meat',
        hungerLevel: 8,
        place: 'dine-in',
        budget: '~1000',
      },
    ],
    candidates: [],
    votes: [],
    runoffVotes: [],
    result: null,
    createdAt: new Date().toISOString(),
  };

  const validBody = {
    memberId: 'member-uuid',
    allergy: ['卵'],
    category: 'meat',
    hungerLevel: 8,
    place: 'dine-in',
    budget: '~1000',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: 好み送信成功 → 200', async () => {
    vi.mocked(sessionService.submitPreferences).mockResolvedValue(mockSession);

    const req = makeRequest('session-uuid', validBody);
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ session: mockSession });
    expect(sessionService.submitPreferences).toHaveBeenCalledWith('session-uuid', 'member-uuid', {
      allergy: ['卵'],
      category: 'meat',
      hungerLevel: 8,
      place: 'dine-in',
      budget: '~1000',
    });
  });

  it('バリデーションエラー: memberId なし → 400', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { memberId: _memberId, ...withoutMemberId } = validBody;
    const req = makeRequest('session-uuid', withoutMemberId);
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('バリデーションエラー: 不正な category → 400', async () => {
    const req = makeRequest('session-uuid', { ...validBody, category: 'vegan' });
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('セッション不存在 → 404', async () => {
    vi.mocked(sessionService.submitPreferences).mockRejectedValue(
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
