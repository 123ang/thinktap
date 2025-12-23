'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/api';
import { Session, Quiz, SessionMode } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HostLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const { t } = useLanguage();

  const [session, setSession] = useState<Session | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Load quiz first
        const quizData = await api.quizzes.getById(quizId);
        setQuiz(quizData);
        setTitle(quizData.title);

        // Check if there's an existing active session for this quiz
        const sessions = await api.sessions.getAll();
        const existingSession = sessions.find(
          (s) => s.quizId === quizId && s.status !== 'ENDED'
        );

        if (existingSession) {
          setSession(existingSession);
        } else {
          // Create a new session for this quiz
          const newSession = await api.sessions.create({
            quizId: quizId,
            mode: SessionMode.RUSH,
          });
          setSession(newSession);
        }
      } catch (error: any) {
        console.error('Error loading quiz/session:', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [quizId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedTitle = localStorage.getItem(`thinktap-title-${quizId}`);
    if (storedTitle) setTitle(storedTitle);
  }, [quizId]);

  const handleStart = () => {
    if (session) {
      // Host proceeds to the full live control page
      router.push(`/session/${session.id}`);
    }
  };

  if (loading || !session || !quiz) {
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
            {title || t('host.title')}
          </CardTitle>
          <CardDescription className="text-sm text-rose-700">
            {t('host.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end">
          <Button
            size="lg"
            onClick={handleStart}
            className="px-8 bg-rose-600 hover:bg-rose-700 text-rose-50"
          >
            {t('host.start')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


