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
  const { socket, connected, currentQuestion, preCountdown } = useSocket({ autoConnect: true });
  const hasJoined = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(`thinktap-nickname-${sessionId}`);
    setNickname(stored || '');
  }, [sessionId]);

  // If a question is already active when we load, skip waiting and go straight to participant view
  useEffect(() => {
    if (currentQuestion) {
      router.replace(`/session/${sessionId}/participant`);
    }
  }, [currentQuestion, router, sessionId]);

  // Join session via HTTP endpoint when nickname and socket are ready
  useEffect(() => {
    const doJoin = async () => {
      if (!nickname || !connected || !socket || hasJoined.current) return;
      hasJoined.current = true;
      try {
        // Get session by ID to get the actual session ID (not code)
        let actualSessionId: string;
        try {
          const session = await api.sessions.getById(sessionId);
          actualSessionId = session.id;
        } catch (err) {
          // If getById fails, try using sessionId as code to get the session
          try {
            const session = await api.sessions.getByCode(sessionId);
            actualSessionId = session.id;
          } catch (err2) {
            console.error('Could not find session:', err2);
            hasJoined.current = false;
            return;
          }
        }

        // Join via HTTP endpoint
        const result = await api.sessions.join(actualSessionId, {
          nickname,
          role: 'student',
        });

        console.log('[Waiting] Joined session:', result);

        // After HTTP join, join Socket.IO room for broadcasts
        if (socket) {
          socket.emit('join_room', {
            sessionId: actualSessionId,
            nickname,
            role: 'student',
          });
        }
      } catch (err: any) {
        console.error('[Waiting] Failed to join session:', err);
        if (err?.response?.data?.message?.includes('nickname') || err?.response?.status === 400) {
          // Duplicate nickname or other validation error
          localStorage.removeItem(`thinktap-nickname-${sessionId}`);
          router.replace(`/session/${sessionId}/join?duplicate=1`);
        }
        hasJoined.current = false;
      }
    };

    void doJoin();
  }, [nickname, sessionId, connected, socket, router]);

  // Note: Duplicate nickname rejection is now handled in the HTTP join endpoint
  // No need for Socket.IO join_rejected listener

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

  // Show full-screen countdown when pre_countdown event is received
  if (preCountdown !== null) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 z-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-8">
          <p className="text-2xl text-white/90 font-medium">Get Ready!</p>
          <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-9xl font-bold text-white">{preCountdown}</span>
          </div>
          <p className="text-xl text-white/80">Quiz starting soon...</p>
        </div>
      </div>
    );
  }

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


