import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSession, getSession, joinSession } from '@/lib/session-service';
import * as kv from '@/lib/kv';
import { AppError } from '@/lib/errors';
import type { Session } from '@/lib/types';

vi.mock('@/lib/kv');

describe('createSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(kv.setSession).mockResolvedValue(undefined);
  });

  it('セッションが正しい構造で作成される', async () => {
    const session = await createSession('山田太郎', '渋谷駅');

    expect(session).toMatchObject({
      location: '渋谷駅',
      status: 'gathering',
      preferences: [],
      candidates: [],
      votes: [],
      runoffVotes: [],
      result: null,
    });
    expect(typeof session.id).toBe('string');
    expect(typeof session.organizerId).toBe('string');
    expect(session.members).toHaveLength(1);
    expect(session.members[0]).toMatchObject({
      displayName: '山田太郎',
      isOrganizer: true,
    });
    expect(typeof session.members[0].id).toBe('string');
    expect(typeof session.createdAt).toBe('string');
    // ISO文字列であること
    expect(() => new Date(session.createdAt)).not.toThrow();
  });

  it('KVにTTL付きで保存される', async () => {
    const session = await createSession('山田太郎', '渋谷駅');
    expect(kv.setSession).toHaveBeenCalledWith(session.id, session);
  });
});

describe('joinSession', () => {
  const mockSession: Session = {
    id: 'session-id',
    organizerId: 'organizer-id',
    location: '渋谷駅',
    status: 'gathering',
    members: [{ id: 'organizer-id', displayName: '山田太郎', isOrganizer: true }],
    preferences: [],
    candidates: [],
    votes: [],
    runoffVotes: [],
    result: null,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(kv.getSession).mockResolvedValue(mockSession);
    vi.mocked(kv.setSession).mockResolvedValue(undefined);
  });

  it('メンバーが正しく追加される', async () => {
    const { session, member } = await joinSession('session-id', '鈴木花子');

    expect(session.members).toHaveLength(2);
    expect(member.displayName).toBe('鈴木花子');
    expect(typeof member.id).toBe('string');
    expect(kv.setSession).toHaveBeenCalledWith(
      'session-id',
      expect.objectContaining({
        members: expect.arrayContaining([expect.objectContaining({ displayName: '鈴木花子' })]),
      }),
    );
  });

  it('isOrganizer が false になる', async () => {
    const { member } = await joinSession('session-id', '鈴木花子');
    expect(member.isOrganizer).toBe(false);
  });

  it('gathering 以外のステータスでエラー', async () => {
    vi.mocked(kv.getSession).mockResolvedValue({ ...mockSession, status: 'voting' });

    await expect(joinSession('session-id', '鈴木花子')).rejects.toThrow(AppError);
    await expect(joinSession('session-id', '鈴木花子')).rejects.toMatchObject({
      code: 'SESSION_CLOSED',
      statusCode: 400,
    });
  });
});

describe('getSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('存在するセッションを返す', async () => {
    const mockSession = {
      id: 'test-id',
      organizerId: 'organizer-id',
      location: '渋谷駅',
      status: 'gathering' as const,
      members: [],
      preferences: [],
      candidates: [],
      votes: [],
      runoffVotes: [],
      result: null,
      createdAt: new Date().toISOString(),
    };
    vi.mocked(kv.getSession).mockResolvedValue(mockSession);

    const result = await getSession('test-id');
    expect(result).toEqual(mockSession);
    expect(kv.getSession).toHaveBeenCalledWith('test-id');
  });

  it('存在しないセッションでエラーを投げる', async () => {
    vi.mocked(kv.getSession).mockResolvedValue(null);

    await expect(getSession('nonexistent-id')).rejects.toThrow(AppError);
    await expect(getSession('nonexistent-id')).rejects.toMatchObject({
      code: 'SESSION_NOT_FOUND',
      statusCode: 404,
    });
  });
});
