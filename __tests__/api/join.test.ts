import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/sessions/[id]/join/route';
import * as sessionService from '@/lib/session-service';
import { AppError } from '@/lib/errors';
import type { Session, Member } from '@/lib/types';

vi.mock('@/lib/session-service');

function makeRequest(id: string, body: unknown) {
  return new Request(`http://localhost/api/sessions/${id}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/sessions/[id]/join', () => {
  const mockSession: Session = {
    id: 'session-uuid',
    organizerId: 'organizer-uuid',
    location: '渋谷駅',
    status: 'gathering',
    members: [
      { id: 'organizer-uuid', displayName: '山田太郎', isOrganizer: true },
      { id: 'member-uuid', displayName: '鈴木花子', isOrganizer: false },
    ],
    preferences: [],
    candidates: [],
    votes: [],
    runoffVotes: [],
    result: null,
    createdAt: new Date().toISOString(),
  };

  const mockMember: Member = {
    id: 'member-uuid',
    displayName: '鈴木花子',
    isOrganizer: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: 参加成功 → 200', async () => {
    vi.mocked(sessionService.joinSession).mockResolvedValue({
      session: mockSession,
      member: mockMember,
    });

    const req = makeRequest('session-uuid', { displayName: '鈴木花子' });
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ session: mockSession, member: mockMember });
    expect(sessionService.joinSession).toHaveBeenCalledWith('session-uuid', '鈴木花子');
  });

  it('バリデーションエラー: displayName なし → 400', async () => {
    const req = makeRequest('session-uuid', {});
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('セッション不存在 → 404', async () => {
    vi.mocked(sessionService.joinSession).mockRejectedValue(
      new AppError('SESSION_NOT_FOUND', 'セッションが見つかりません', 404),
    );

    const req = makeRequest('nonexistent-id', { displayName: '鈴木花子' });
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'nonexistent-id' }),
    });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });

  it('セッション締め切り済み → 400', async () => {
    vi.mocked(sessionService.joinSession).mockRejectedValue(
      new AppError('SESSION_CLOSED', 'このセッションは締め切られています', 400),
    );

    const req = makeRequest('session-uuid', { displayName: '鈴木花子' });
    const res = await POST(req as never, {
      params: Promise.resolve({ id: 'session-uuid' }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
