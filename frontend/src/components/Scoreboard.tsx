'use client';

import { RankingEntry } from '@/types/api';

interface ScoreboardProps {
  rankings: RankingEntry[];
}

export function Scoreboard({ rankings }: ScoreboardProps) {
  if (rankings.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6">
        <div className="text-center text-gray-500 py-8">
          No rankings available yet
        </div>
      </div>
    );
  }

  // Get emoji for rank
  const getEmoji = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '👤';
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden">
      <div className="max-h-[600px] overflow-y-auto">
        <div className="space-y-3 p-4">
          {rankings.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-md hover:shadow-lg transition-all border-2 border-gray-100"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="text-3xl flex-shrink-0">
                  {getEmoji(entry.rank)}
                </div>
                <span className="text-lg font-bold text-gray-900 truncate">
                  {entry.username}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 flex-shrink-0 ml-4">
                {entry.points}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

