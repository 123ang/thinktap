'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

function JoinSpecificSessionPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;

  const [nickname, setNickname] = useState('');
  const duplicate = searchParams.get('duplicate') === '1';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem(`thinktap-nickname-${sessionId}`, trimmed);
    }

    router.push(`/session/${sessionId}/waiting`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl text-center w-full">Join Quiz</CardTitle>
          </div>
          <CardDescription className="text-center">
            Enter a nickname to join this quiz.
          </CardDescription>
          {duplicate && (
            <p className="mt-2 text-xs text-center text-red-600 font-medium">
              This nickname is already being used in this quiz. Please choose another one.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="nickname">
                Nickname
              </label>
              <Input
                id="nickname"
                placeholder="Type your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11"
              disabled={!nickname.trim()}
            >
              Join
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Make sure you recognize your nickname on the host screen.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinSpecificSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <JoinSpecificSessionPageContent />
    </Suspense>
  );
}


