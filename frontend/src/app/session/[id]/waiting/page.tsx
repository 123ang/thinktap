'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/lib/api';
import { useSocket } from '@/hooks';

export default function WaitingForQuizPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const { joinSession, socket, connected } = useSocket({ autoConnect: true });
  const hasJoined = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(`thinktap-nickname-${sessionId}`);
    setNickname(stored || '');
  }, [sessionId]);

  // After we have nickname AND socket is connected, actually join the websocket session so the host sees us
  useEffect(() => {
    const doJoin = async () => {
      if (!nickname || !connected || hasJoined.current) return;
      hasJoined.current = true;
      try {
        // Try to get session by ID first, if that fails, try using sessionId as code
        let sessionCode: string;
        try {
          const session = await api.sessions.getById(sessionId);
          sessionCode = session.code;
        } catch (err) {
          // If getById fails (404), the sessionId might actually be the session code
          // This can happen if the URL uses the code instead of the ID
          console.warn('Could not get session by ID, using sessionId as code');
          sessionCode = sessionId;
        }
        joinSession(sessionCode, nickname);
      } catch (err) {
        console.error('Failed to join live session from waiting page:', err);
        hasJoined.current = false;
      }
    };

    void doJoin();
  }, [nickname, sessionId, joinSession, connected]);

  // Listen for duplicate nickname rejection
  useEffect(() => {
    if (!socket) return;
    const handler = (payload: { reason: string; message?: string }) => {
      if (payload.reason === 'duplicate_nickname') {
        // Clear stored nickname and send back to join page with a flag
        localStorage.removeItem(`thinktap-nickname-${sessionId}`);
        router.replace(`/session/${sessionId}/join?duplicate=1`);
      }
    };
    socket.on('join_rejected', handler);
    return () => {
      socket.off('join_rejected', handler);
    };
  }, [socket, sessionId, router]);

  // Redirect to participant page when question starts
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      router.replace(`/session/${sessionId}/participant`);
    };
    socket.on('question_started', handler);
    return () => {
      socket.off('question_started', handler);
    };
  }, [socket, sessionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-sky-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl text-center">You&apos;re in!</CardTitle>
          <CardDescription className="text-center">
            Did you see your nickname on screen?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Your nickname</p>
            <p className="text-2xl font-bold">
              {nickname || 'Waiting...'}
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Please wait while your lecturer starts the quiz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


