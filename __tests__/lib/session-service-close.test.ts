import { describe, it, expect, vi, beforeEach } from 'vitest';
import { closeSession } from '@/lib/session-service';
import * as kv from '@/lib/kv';
import * as gemini from '@/lib/gemini';
import type { Candidate, Session } from '@/lib/types';

vi.mock('@/lib/kv');
vi.mock('@/lib/gemini');

const sampleCandidates: Candidate[] = [
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

const mockSession: Session = {
  id: 'session-1',
  organizerId: 'organizer-id',
  location: '渋谷駅',
  status: 'gathering',
  members: [
    { id: 'organizer-id', displayName: '山田太郎', isOrganizer: true },
    { id: 'member-id', displayName: '鈴木花子', isOrganizer: false },
  ],
  preferences: [
    {
      memberId: 'organizer-id',
      allergy: [],
      category: 'meat',
      hungerLevel: 7,
      place: null,
      budget: '~1000円',
    },
    {
      memberId: 'member-id',
      allergy: [],
      category: 'meat',
      hungerLevel: 6,
      place: null,
      budget: '~1000円',
    },
  ],
  candidates: [],
  votes: [],
  runoffVotes: [],
  result: null,
  createdAt: new Date().toISOString(),
};

describe('closeSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(kv.setSession).mockResolvedValue(undefined);
    vi.mocked(gemini.generateCandidates).mockResolvedValue(sampleCandidates);
  });

  it('正常系: 候補生成 + ステータスが voting に変更される', async () => {
    vi.mocked(kv.getSession).mockResolvedValue(mockSession);

    const result = await closeSession('session-1', 'organizer-id');

    expect(result.status).toBe('voting');
    expect(result.candidates).toHaveLength(3);
    expect(gemini.generateCandidates).toHaveBeenCalledOnce();
    expect(kv.setSession).toHaveBeenCalledWith(
      'session-1',
      expect.objectContaining({ status: 'voting', candidates: sampleCandidates }),
    );
  });

  it('幹事以外が操作するとUNAUTHORIZEDエラー', async () => {
    vi.mocked(kv.getSession).mockResolvedValue(mockSession);

    await expect(closeSession('session-1', 'member-id')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      statusCode: 403,
    });
    expect(kv.setSession).not.toHaveBeenCalled();
  });

  it('gathering 以外のステータスでINVALID_STATUSエラー', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({ ...mockSession, status: 'voting' });

    await expect(closeSession('session-1', 'organizer-id')).rejects.toMatchObject({
      code: 'INVALID_STATUS',
      statusCode: 400,
    });
    expect(kv.setSession).not.toHaveBeenCalled();
  });

  it('preferences が空の場合 NO_PREFERENCES エラー', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({ ...mockSession, preferences: [] });

    await expect(closeSession('session-1', 'organizer-id')).rejects.toMatchObject({
      code: 'NO_PREFERENCES',
      statusCode: 400,
    });
    expect(kv.setSession).not.toHaveBeenCalled();
  });
});
