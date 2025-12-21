'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/api';
import { Session } from '@/types/api';

export default function HostLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.sessions.getById(sessionId);
        setSession(data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedTitle = localStorage.getItem(`thinktap-title-${sessionId}`);
    if (storedTitle) setTitle(storedTitle);
  }, [sessionId]);

  const handleStart = () => {
    // Host proceeds to the full live control page
    router.push(`/session/${sessionId}`);
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 px-4">
      <Card className="max-w-xl w-full bg-rose-50/95 border border-rose-200 shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-rose-900">
            {title || 'Host ThinkTap'}
          </CardTitle>
          <CardDescription className="text-sm text-rose-700">
            When you press start, a colorful lobby will open with a game PIN and QR code so students can join.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end">
          <Button
            size="lg"
            onClick={handleStart}
            className="px-8 bg-rose-600 hover:bg-rose-700 text-rose-50"
          >
            Start
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


