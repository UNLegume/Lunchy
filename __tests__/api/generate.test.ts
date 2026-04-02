import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/kv', () => ({
  getSession: vi.fn(),
  setSession: vi.fn(),
}));

vi.mock('@/lib/gemini', () => ({
  generateCandidates: vi.fn(),
}));

import { getSession, setSession } from '@/lib/kv';
import { generateCandidates } from '@/lib/gemini';
import { POST } from '@/app/api/sessions/[id]/generate/route';
import type { Session } from '@/lib/types';
import { NextRequest } from 'next/server';

const mockGetSession = getSession as ReturnType<typeof vi.fn>;
const mockSetSession = setSession as ReturnType<typeof vi.fn>;
const mockGenerateCandidates = generateCandidates as ReturnType<typeof vi.fn>;

const sampleSession: Session = {
  id: 'session-1',
  organizerId: 'member-1',
  location: '渋谷駅',
  status: 'gathering',
  members: [{ id: 'member-1', displayName: '太郎', isOrganizer: true }],
  preferences: [
    {
      memberId: 'member-1',
      allergy: [],
      category: 'meat',
      hungerLevel: 7,
      place: null,
      budget: '~1000円',
    },
  ],
  candidates: [],
  votes: [],
  runoffVotes: [],
  result: null,
  createdAt: '2026-04-02T00:00:00.000Z',
};

const sampleCandidates = [
  {
    id: 'candidate-1',
    name: '焼肉屋A',
    genre: '焼肉',
    walkMinutes: 5,
    rating: 4.2,
    priceRange: '~1000円',
    photoUrl: '',
  },
  {
    id: 'candidate-2',
    name: '牛丼屋B',
    genre: '牛丼',
    walkMinutes: 3,
    rating: 3.8,
    priceRange: '~600円',
    photoUrl: '',
  },
  {
    id: 'candidate-3',
    name: 'ステーキCafe',
    genre: 'ステーキ',
    walkMinutes: 8,
    rating: 4.5,
    priceRange: '~2000円',
    photoUrl: '',
  },
];

function makeRequest(sessionId: string): NextRequest {
  return new NextRequest(`http://localhost/api/sessions/${sessionId}/generate`, {
    method: 'POST',
  });
}

function makeParams(sessionId: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id: sessionId }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSetSession.mockResolvedValue(undefined);
});

describe('POST /api/sessions/[id]/generate', () => {
  it('正常系: セッション取得 → AI候補生成 → ステータス voting に更新 → 候補を返す', async () => {
    mockGetSession.mockResolvedValue(sampleSession);
    mockGenerateCandidates.mockResolvedValue(sampleCandidates);

    const response = await POST(makeRequest('session-1'), makeParams('session-1'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.candidates).toHaveLength(3);
    expect(body.candidates[0].name).toBe('焼肉屋A');

    expect(mockSetSession).toHaveBeenCalledOnce();
    const savedSession: Session = mockSetSession.mock.calls[0][1];
    expect(savedSession.status).toBe('voting');
    expect(savedSession.candidates).toHaveLength(3);
  });

  it('セッションが存在しない場合 404 を返す', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest('nonexistent'), makeParams('nonexistent'));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBeDefined();
    expect(mockGenerateCandidates).not.toHaveBeenCalled();
  });

  it('preferences が空の場合でも generateCandidates を呼ぶ', async () => {
    const emptySession: Session = { ...sampleSession, preferences: [] };
    mockGetSession.mockResolvedValue(emptySession);
    mockGenerateCandidates.mockResolvedValue(sampleCandidates);

    const response = await POST(makeRequest('session-1'), makeParams('session-1'));

    expect(response.status).toBe(200);
    expect(mockGenerateCandidates).toHaveBeenCalledOnce();
  });

  it('generateCandidates がエラーを投げた場合 500 を返す', async () => {
    mockGetSession.mockResolvedValue(sampleSession);
    mockGenerateCandidates.mockRejectedValue(new Error('API Error'));

    const response = await POST(makeRequest('session-1'), makeParams('session-1'));

    expect(response.status).toBe(500);
    expect(mockSetSession).not.toHaveBeenCalled();
  });
});
