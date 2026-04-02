import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

import { kv } from '@vercel/kv';
import { getSession, setSession, deleteSession } from '@/lib/kv';
import type { Session } from '@/lib/types';

const mockKv = kv as {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
};

const sampleSession: Session = {
  id: 'session-1',
  organizerId: 'member-1',
  location: '渋谷駅',
  status: 'gathering',
  members: [],
  preferences: [],
  candidates: [],
  votes: [],
  runoffVotes: [],
  result: null,
  createdAt: '2026-04-02T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getSession', () => {
  it('KVにセッションが存在する場合、そのセッションを返す', async () => {
    mockKv.get.mockResolvedValue(sampleSession);
    const result = await getSession('session-1');
    expect(mockKv.get).toHaveBeenCalledWith('session:session-1');
    expect(result).toEqual(sampleSession);
  });

  it('KVにセッションが存在しない場合、null を返す', async () => {
    mockKv.get.mockResolvedValue(null);
    const result = await getSession('nonexistent');
    expect(mockKv.get).toHaveBeenCalledWith('session:nonexistent');
    expect(result).toBeNull();
  });
});

describe('setSession', () => {
  it('TTL 86400 秒でセッションを保存する', async () => {
    mockKv.set.mockResolvedValue('OK');
    await setSession('session-1', sampleSession);
    expect(mockKv.set).toHaveBeenCalledWith('session:session-1', sampleSession, { ex: 86400 });
  });
});

describe('deleteSession', () => {
  it('指定した ID のセッションを削除する', async () => {
    mockKv.del.mockResolvedValue(1);
    await deleteSession('session-1');
    expect(mockKv.del).toHaveBeenCalledWith('session:session-1');
  });
});
