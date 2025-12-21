'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Award } from 'lucide-react';
import { LeaderboardEntry } from '@/types/api';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top performers in this session</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No leaderboard data available yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead className="text-center">Correct</TableHead>
                <TableHead className="text-center">Answered</TableHead>
                <TableHead className="text-center">Avg Time</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.userId} className={entry.rank <= 3 ? 'bg-yellow-50' : ''}>
                  <TableCell className="font-medium">
                    {getRankIcon(entry.rank)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.email || `User ${entry.userId.substring(0, 8)}`}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {entry.totalCorrect}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{entry.totalAnswered}</TableCell>
                  <TableCell className="text-center">
                    {Math.round(entry.avgResponseTimeMs)}ms
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {entry.score.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

