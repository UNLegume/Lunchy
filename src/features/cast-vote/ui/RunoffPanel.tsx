'use client';

import { useState } from 'react';
import { CandidateCard, Button } from '@/src/shared/ui';
import { apiPost } from '@/src/shared/api/client';
import type { Candidate, Vote } from '@/lib/types';

type RunoffPanelProps = {
  sessionId: string;
  candidates: Candidate[];
  memberId: string;
  votes: Vote[];
  runoffVotes: Vote[];
  members: { id: string }[];
};

type RunoffResponse = {
  session: { runoffVotes: Vote[]; status: string; result: Candidate | null };
};

function getTopTwoCandidates(candidates: Candidate[], votes: Vote[]): Candidate[] {
  const tally = new Map<string, number>();

  for (const candidate of candidates) {
    tally.set(candidate.id, 0);
  }

  for (const vote of votes) {
    tally.set(vote.candidateId, (tally.get(vote.candidateId) ?? 0) + 1);
  }

  const sorted = [...candidates].sort((a, b) => {
    const countA = tally.get(a.id) ?? 0;
    const countB = tally.get(b.id) ?? 0;
    return countB - countA;
  });

  return sorted.slice(0, 2);
}

export function RunoffPanel({
  sessionId,
  candidates,
  memberId,
  votes,
  runoffVotes,
  members,
}: RunoffPanelProps) {
  const topTwo = getTopTwoCandidates(candidates, votes);

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasVoted = runoffVotes.some((v) => v.memberId === memberId);

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl mb-4">✅</p>
        <p className="text-lg font-semibold text-[#1A1A1A]">決選投票完了！</p>
        <p className="text-sm text-[#6B7280] mt-2">結果発表を待っています...</p>
      </div>
    );
  }

  async function handleVote() {
    if (!selectedCandidateId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await apiPost<RunoffResponse>(`/api/sessions/${sessionId}/runoff`, {
        memberId,
        candidateId: selectedCandidateId,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '投票に失敗しました');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-50 rounded-xl px-4 py-3 text-center">
        <p className="text-sm text-blue-700 font-medium">
          {runoffVotes.length} / {members.length} 人投票済み
        </p>
      </div>

      <h2 className="text-lg font-bold text-[#1A1A1A] text-center">決選投票</h2>
      <p className="text-sm text-[#6B7280] text-center">どちらのお店にしますか？</p>

      <div className="flex flex-col gap-3">
        {topTwo.map((candidate, index) => (
          <div key={candidate.id}>
            {index === 1 && (
              <div className="flex items-center justify-center my-2">
                <div className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VS</span>
                </div>
              </div>
            )}
            <CandidateCard
              candidate={candidate}
              selected={selectedCandidateId === candidate.id}
              onClick={() => setSelectedCandidateId(candidate.id)}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <Button onClick={() => void handleVote()} disabled={!selectedCandidateId || isSubmitting}>
        {isSubmitting ? '送信中...' : '投票する'}
      </Button>
    </div>
  );
}
