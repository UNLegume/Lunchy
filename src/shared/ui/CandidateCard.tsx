'use client';

import Image from 'next/image';
import type { Candidate } from '@/lib/types';

type CandidateCardProps = {
  candidate: Candidate;
  selected?: boolean;
  onClick?: () => void;
};

export function CandidateCard({ candidate, selected = false, onClick }: CandidateCardProps) {
  const borderClass = selected
    ? 'border-2 border-[#FF6B35] bg-[#FFF3ED]'
    : 'border-2 border-transparent bg-white';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all text-left ${borderClass}`}
    >
      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
        {candidate.photoUrl ? (
          <Image
            src={candidate.photoUrl}
            alt={candidate.name}
            width={400}
            height={128}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">🍽️</span>
        )}
      </div>
      <div className="p-4">
        <p className="font-bold text-base text-[#1A1A1A] mb-1">{candidate.name}</p>
        <p className="text-sm text-[#6B7280]">
          {candidate.genre}　🚶 {candidate.walkMinutes}分　⭐ {candidate.rating.toFixed(1)}　
          {candidate.priceRange}
        </p>
      </div>
    </button>
  );
}
