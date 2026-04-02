'use client';

import Image from 'next/image';
import type { Candidate } from '@/lib/types';

type WinnerCardProps = {
  candidate: Candidate;
};

export function WinnerCard({ candidate }: WinnerCardProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(candidate.name)}`;

  return (
    <div className="w-full rounded-xl border-2 border-[#FF6B35] bg-white shadow-[0_4px_24px_rgba(255,107,53,0.25)] overflow-hidden">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
        {candidate.photoUrl ? (
          <Image
            src={candidate.photoUrl}
            alt={candidate.name}
            width={600}
            height={192}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl">🍽️</span>
        )}
      </div>
      <div className="p-6 flex flex-col gap-3">
        <p className="font-bold text-xl text-[#1A1A1A]">{candidate.name}</p>
        <p className="text-sm text-[#6B7280]">
          {candidate.genre}　🚶 {candidate.walkMinutes}分　⭐ {candidate.rating.toFixed(1)}
          {candidate.priceRange}
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] text-white font-bold py-3 px-4 text-base hover:bg-[#e55a25] transition-colors"
        >
          📍 Google Maps で見る
        </a>
      </div>
    </div>
  );
}
