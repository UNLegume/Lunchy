'use client';

import { useState } from 'react';
import { CandidateCard, Button } from '@/src/shared/ui';
import { apiPost } from '@/src/shared/api/client';
import type { Candidate, Member, Vote } from '@/lib/types';

type VotePanelProps = {
  sessionId: string;
  candidates: Candidate[];
  members: Member[];
  votes: Vote[];
  memberId: string;
};

type VoteResponse = { session: { votes: Vote[]; status: string; result: Candidate | null } };

export function VotePanel({ sessionId, candidates, members, votes, memberId }: VotePanelProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasVoted = votes.some((v) => v.memberId === memberId);

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl mb-4">✅</p>
        <p className="text-lg font-semibold text-[#1A1A1A]">投票完了！</p>
        <p className="text-sm text-[#6B7280] mt-2">結果発表を待っています...</p>
      </div>
    );
  }

  async function handleVote() {
    if (!selectedCandidateId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await apiPost<VoteResponse>(`/api/sessions/${sessionId}/vote`, {
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
          {votes.length} / {members.length} 人投票済み
        </p>
      </div>

      <h2 className="text-lg font-bold text-[#1A1A1A] text-center">どのお店にしますか？</h2>

      <div className="flex flex-col gap-3">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            selected={selectedCandidateId === candidate.id}
            onClick={() => setSelectedCandidateId(candidate.id)}
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <Button onClick={() => void handleVote()} disabled={!selectedCandidateId || isSubmitting}>
        {isSubmitting ? '送信中...' : '投票する'}
      </Button>
    </div>
  );
}
