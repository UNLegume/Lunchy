import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/session-service', () => ({
  closeSession: vi.fn(),
}));

import { closeSession } from '@/lib/session-service';
import { POST } from '@/app/api/sessions/[id]/close/route';
import type { Session } from '@/lib/types';
import { NextRequest } from 'next/server';
import { AppError } from '@/lib/errors';

const mockCloseSession = closeSession as ReturnType<typeof vi.fn>;

const sampleSession: Session = {
  id: 'session-1',
  organizerId: 'organizer-id',
  location: '渋谷駅',
  status: 'voting',
  members: [{ id: 'organizer-id', displayName: '山田太郎', isOrganizer: true }],
  preferences: [
    {
      memberId: 'organizer-id',
      allergy: [],
      category: 'meat',
      hungerLevel: 7,
      place: null,
      budget: '~1000円',
    },
  ],
  candidates: [
    {
      id: 'candidate-1',
      name: '焼肉屋A',
      genre: '焼肉',
      walkMinutes: 5,
      rating: 4.2,
      priceRange: '~1000円',
      photoUrl: '',
    },
  ],
  votes: [],
  runoffVotes: [],
  result: null,
  createdAt: new Date().toISOString(),
};

function makeRequest(sessionId: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`http://localhost/api/sessions/${sessionId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeParams(sessionId: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id: sessionId }) };
}

describe('POST /api/sessions/[id]/close', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: 200 + session を返す', async () => {
    mockCloseSession.mockResolvedValue(sampleSession);

    const response = await POST(
      makeRequest('session-1', { organizerId: 'organizer-id' }),
      makeParams('session-1'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.session).toBeDefined();
    expect(body.session.id).toBe('session-1');
    expect(mockCloseSession).toHaveBeenCalledWith('session-1', 'organizer-id');
  });

  it('権限なし (UNAUTHORIZED): 403 を返す', async () => {
    mockCloseSession.mockRejectedValue(
      new AppError('UNAUTHORIZED', '幹事のみが締め切り操作を行えます', 403),
    );

    const response = await POST(
      makeRequest('session-1', { organizerId: 'member-id' }),
      makeParams('session-1'),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBeDefined();
  });

  it('organizerId が欠けている場合 400 を返す', async () => {
    const response = await POST(makeRequest('session-1', {}), makeParams('session-1'));

    expect(response.status).toBe(400);
  });

  it('INVALID_STATUS の場合 400 を返す', async () => {
    mockCloseSession.mockRejectedValue(
      new AppError('INVALID_STATUS', 'このセッションは既に締め切られています', 400),
    );

    const response = await POST(
      makeRequest('session-1', { organizerId: 'organizer-id' }),
      makeParams('session-1'),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
  });
});
