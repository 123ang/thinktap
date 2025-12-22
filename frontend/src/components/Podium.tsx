'use client';

import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PodiumEntry {
  rank: number;
  username: string;
  correct: number;
  points: number;
}

interface PodiumProps {
  rankings: PodiumEntry[];
}

export function Podium({ rankings }: PodiumProps) {
  // Ensure we have exactly 3 entries (fill with empty if needed)
  const top3 = [
    rankings[1] || null, // 2nd place (left)
    rankings[0] || null, // 1st place (center)
    rankings[2] || null, // 3rd place (right)
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Award className="h-8 w-8 text-orange-600" />;
      default:
        return null;
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 'h-32'; // Tallest for 1st place
      case 2:
        return 'h-24'; // Medium for 2nd place
      case 3:
        return 'h-20'; // Shortest for 3rd place
      default:
        return 'h-16';
    }
  };

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-t from-yellow-400 to-yellow-500';
      case 2:
        return 'bg-gradient-to-t from-gray-300 to-gray-400';
      case 3:
        return 'bg-gradient-to-t from-orange-400 to-orange-500';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="flex items-end justify-center gap-4 px-8 py-6">
      {/* 2nd Place (Left) */}
      <div className="flex flex-col items-center flex-1 max-w-[200px]">
        {top3[0] ? (
          <>
            <div className="mb-2 text-center">
              {getRankIcon(top3[0].rank)}
              <p className="font-bold text-lg mt-1 text-gray-700">{top3[0].username}</p>
              <p className="text-sm text-gray-600">{top3[0].correct} correct</p>
              <p className="text-xs text-gray-500">{top3[0].points} pts</p>
            </div>
            <Card className={`w-full ${getPodiumHeight(top3[0].rank)} ${getPodiumColor(top3[0].rank)} flex items-center justify-center shadow-lg`}>
              <CardContent className="p-0 flex items-center justify-center h-full">
                <span className="text-4xl font-bold text-white">2</span>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className={`w-full h-16 bg-gray-100 flex items-center justify-center`}>
            <CardContent className="p-0 text-gray-400">-</CardContent>
          </Card>
        )}
      </div>

      {/* 1st Place (Center) */}
      <div className="flex flex-col items-center flex-1 max-w-[200px]">
        {top3[1] ? (
          <>
            <div className="mb-2 text-center">
              {getRankIcon(top3[1].rank)}
              <p className="font-bold text-xl mt-1 text-yellow-700">{top3[1].username}</p>
              <p className="text-sm text-yellow-600">{top3[1].correct} correct</p>
              <p className="text-xs text-yellow-500">{top3[1].points} pts</p>
            </div>
            <Card className={`w-full ${getPodiumHeight(top3[1].rank)} ${getPodiumColor(top3[1].rank)} flex items-center justify-center shadow-xl border-4 border-yellow-300`}>
              <CardContent className="p-0 flex items-center justify-center h-full">
                <span className="text-5xl font-bold text-white">1</span>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className={`w-full h-16 bg-gray-100 flex items-center justify-center`}>
            <CardContent className="p-0 text-gray-400">-</CardContent>
          </Card>
        )}
      </div>

      {/* 3rd Place (Right) */}
      <div className="flex flex-col items-center flex-1 max-w-[200px]">
        {top3[2] ? (
          <>
            <div className="mb-2 text-center">
              {getRankIcon(top3[2].rank)}
              <p className="font-bold text-lg mt-1 text-orange-700">{top3[2].username}</p>
              <p className="text-sm text-orange-600">{top3[2].correct} correct</p>
              <p className="text-xs text-orange-500">{top3[2].points} pts</p>
            </div>
            <Card className={`w-full ${getPodiumHeight(top3[2].rank)} ${getPodiumColor(top3[2].rank)} flex items-center justify-center shadow-lg`}>
              <CardContent className="p-0 flex items-center justify-center h-full">
                <span className="text-4xl font-bold text-white">3</span>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className={`w-full h-16 bg-gray-100 flex items-center justify-center`}>
            <CardContent className="p-0 text-gray-400">-</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

