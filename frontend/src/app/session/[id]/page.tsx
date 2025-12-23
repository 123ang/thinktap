'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSocket, useAuth, useQuestions } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { SessionStatus, ModeStatus } from '@/components/SessionStatus';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Session, CreateQuestionDto, QuestionType, QuizSettings } from '@/types/api';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Play, 
  Square, 
  BarChart,
  Copy,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import Link from 'next/link';
import { Podium } from '@/components/Podium';
import { Scoreboard } from '@/components/Scoreboard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function LecturerSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [quizTitle, setQuizTitle] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [topRankings, setTopRankings] = useState<any[]>([]);
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(null);
  const [hasSeenCountdown, setHasSeenCountdown] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const {
    connected,
    participantCount,
    participantNames,
    currentQuestion,
    timeRemaining,
    results,
    rankings,
    preCountdown,
    emitPreCountdown,
    startQuestion,
    showResults,
    endSession,
    clearQuestion,
    socket,
  } = useSocket({ sessionCode: session?.code, role: 'lecturer' });

  const quizSettings: QuizSettings | undefined = session?.quiz?.settings as QuizSettings | undefined;
  const musicEnabled = quizSettings?.musicEnabled ?? true;
  const musicTrack = quizSettings?.musicTrack ?? 'jumanji_drum.mp3';
  const countdownEnabled = quizSettings?.countdownEnabled ?? true;
  const podiumEnabled = quizSettings?.podiumEnabled ?? true;

  // Debug: Log when results change
  useEffect(() => {
    console.log('[Lecturer] Results state changed:', results);
  }, [results]);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Initialise background music player for lecturer screen only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!audioRef.current) {
      const audio = new Audio(`/` + musicTrack);
      audio.loop = true;
      audioRef.current = audio;
    } else {
      // Update track if settings changed
      if (audioRef.current.src && !audioRef.current.src.endsWith(`/${musicTrack}`)) {
        audioRef.current.src = `/${musicTrack}`;
        audioRef.current.loop = true;
      }
    }

    const audio = audioRef.current;
    if (musicEnabled && !isMuted) {
      audio
        .play()
        .catch(() => {
          // Autoplay might be blocked; user can start via unmute toggle.
        });
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [musicEnabled, musicTrack, isMuted]);

  // Clear question state if session is not ACTIVE (to prevent showing stale questions)
  useEffect(() => {
    if (session && session.status !== 'ACTIVE' && currentQuestion) {
      console.log('[Lecturer] Session not ACTIVE, clearing question state');
      clearQuestion();
      setPendingQuestionId(null); // Also clear pending question
      setHasSeenCountdown(false);
    }
  }, [session?.status, currentQuestion, clearQuestion]);

  // Ensure lecturer joins the session room when session loads
  useEffect(() => {
    const joinRoom = async () => {
      if (session?.id && connected && socket) {
        try {
          // Join via HTTP first to initialize Redis state
          await api.sessions.join(session.id, {
            role: 'lecturer',
          });
          
          // Then join Socket.IO room for broadcasts
          socket.emit('join_room', {
            sessionId: session.id,
            role: 'lecturer',
            userId: user?.id,
          });
          console.log('[Lecturer] Joined session room:', session.id);
        } catch (error) {
          console.error('[Lecturer] Failed to join session:', error);
        }
      }
    };

    void joinRoom();
  }, [session?.id, connected, socket]);

  // Listen for question started confirmation to show toast
  useEffect(() => {
    const handleQuestionStarted = () => {
      toast.success(t('lecturer.questionStarted'));
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('question_started_confirmed', handleQuestionStarted);
      return () => {
        window.removeEventListener('question_started_confirmed', handleQuestionStarted);
      };
    }
  }, []);

  // Removed auto-start - lecturer must manually start questions

  // Load quiz title from localStorage (saved in builder) so host-live screen can show it
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedTitle = localStorage.getItem(`thinktap-title-${sessionId}`);
    if (storedTitle) {
      setQuizTitle(storedTitle);
    }
    // Build join URL for QR code - use the generic join page
    setJoinUrl('https://thinktap.link/session/join');
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const data = await api.sessions.getById(sessionId);
      setSession(data);
      
      // Load questions from the quiz
      if (data.quizId) {
        await loadQuestions(data.quizId);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error(t('lecturer.failedLoad'));
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (quizId: string) => {
    setQuestionsLoading(true);
    try {
      const data = await api.questions.getAll(quizId);
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error(t('lecturer.failedLoadQuestions'));
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.code);
      setCodeCopied(true);
      toast.success(t('lecturer.codeCopied'));
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleStartSession = async () => {
    try {
      // Clear any existing question state before starting session
      clearQuestion();
      await api.sessions.updateStatus(sessionId, 'ACTIVE');
      await loadSession();
      toast.success(t('lecturer.sessionStarted'));
    } catch (error) {
      toast.error(t('lecturer.failedStart'));
    }
  };

  const handleEndSession = async () => {
    try {
      console.log('[Lecturer] handleEndSession called with params.id:', sessionId, 'session.id:', session?.id);
      await api.sessions.updateStatus(sessionId, 'ENDED');
      endSession(sessionId);
      
      // Fetch top 3 rankings
      try {
        const rankings = await api.responses.getTopRankings(sessionId, 3);
        console.log('[Lecturer] Top rankings received for sessionId:', sessionId, rankings);
        setTopRankings(rankings);
        setShowPodium(true);
      } catch (error: any) {
        console.error('Error fetching rankings:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });
        // Still show podium even if rankings fail, but with empty rankings
        setTopRankings([]);
        setShowPodium(true);
        toast.warning(t('lecturer.rankingsLoadWarning'));
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error(t('lecturer.failedEndSession'));
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleStartQuestion = (questionId: string) => {
    if (!connected) {
      toast.error(t('lecturer.notConnected'));
      return;
    }

    console.log('[Lecturer] handleStartQuestion called:', {
      questionId,
      currentQuestion: currentQuestion?.id,
      preCountdown,
      pendingQuestionId,
    });

    // If this is the first question (no currentQuestion yet), broadcast a 5-second countdown
    if (countdownEnabled && !currentQuestion && preCountdown === null && !hasSeenCountdown) {
      console.log('[Lecturer] Starting pre-countdown for first question');
      setPendingQuestionId(questionId);
      setHasSeenCountdown(false);
      // Emit pre_countdown to all clients via socket
      emitPreCountdown(sessionId, 5);
      return;
    }

    // For subsequent questions, start immediately
    console.log('[Lecturer] Starting question immediately (not first question)');
    startQuestion(sessionId, questionId);
  };

  // Manage countdown lifecycle: mark when it starts, and start question when it finishes
  useEffect(() => {
    // Countdown just started
    if (preCountdown !== null && !hasSeenCountdown) {
      console.log('[Lecturer] Countdown started with value:', preCountdown);
      setHasSeenCountdown(true);
      return;
    }

    // Countdown finished -> start pending question
    if (preCountdown === null && hasSeenCountdown && pendingQuestionId) {
      console.log('[Lecturer] Countdown finished, starting question:', pendingQuestionId);
      startQuestion(sessionId, pendingQuestionId);
      setPendingQuestionId(null);
      setHasSeenCountdown(false);
    }
  }, [preCountdown, hasSeenCountdown, pendingQuestionId, sessionId, startQuestion]);

  const handleShowResults = (questionId: string) => {
    console.log('[Lecturer] Showing results for question:', questionId);
    showResults(sessionId, questionId);
  };

  // Show podium when session ends
  if (showPodium && podiumEnabled) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl space-y-6">
            <Card className="bg-white/95 backdrop-blur shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-4xl font-bold mb-2">{t('lecturer.sessionComplete')}</CardTitle>
                <CardDescription className="text-xl">{t('lecturer.topPerformers')}</CardDescription>
              </CardHeader>
              <CardContent>
                {topRankings.length > 0 ? (
                  <Podium rankings={topRankings} />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {t('lecturer.noRankingsAvailable')}
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Button onClick={handleBackToDashboard} size="lg" className="px-8">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('lecturer.backToDashboard')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header (without game PIN / QR – those are in the container below) */}
        <header className="bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 text-rose-50 shadow-sm border-b border-rose-200">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                  <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-50 hover:bg-rose-600/40 hover:text-rose-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('lecturer.back')}
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold pb-1">
                    {quizTitle || `${t('lecturer.quiz')} ${session.code}`}
                  </h1>
                  <SessionStatus status={session.status} />
                  <ModeStatus mode={session.mode} />
                </div>
                <p className="text-sm text-rose-50/90">
                  {connected ? t('lecturer.connected') : t('lecturer.disconnected')} • {participantCount} {participantCount === 1 ? t('lecturer.participant') : t('lecturer.participants')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {session.status === 'CREATED' && (
                <Button
                  onClick={handleStartSession}
                  className="bg-emerald-500 hover:bg-emerald-600 text-emerald-50"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {t('lecturer.startSession')}
                </Button>
              )}
              {session.status === 'ACTIVE' && (
                <Button
                  variant="destructive"
                  onClick={handleEndSession}
                  className="bg-rose-800 hover:bg-rose-900 text-rose-50"
                >
                  <Square className="mr-2 h-4 w-4" />
                  {t('lecturer.endSession')}
                </Button>
              )}
              {session.status === 'ENDED' && user?.plan !== 'FREE' && (
                <Link href={`/session/${sessionId}/insights`}>
                  <Button
                    variant="outline"
                    className="bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-300"
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    {t('lecturer.viewInsights')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Game PIN + QR container just under header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl bg-white/95 border border-rose-100 px-6 py-4 shadow">
            <div>
              <p className="text-xs uppercase tracking-wide text-rose-500 font-semibold">
                {t('lecturer.gamePin')}
              </p>
              <p className="text-3xl md:text-4xl font-mono font-bold text-rose-700">
                {session.code}
              </p>
            </div>
            {joinUrl && (
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center overflow-hidden shadow">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      joinUrl,
                    )}`}
                    alt={t('lecturer.qrCodeAlt')}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="text-xs text-rose-700 max-w-xs">
                  {t('lecturer.qrCodeInstructions')}
                </div>
              </div>
            )}
          </div>

          {/* Full-screen pre-countdown overlay */}
          {preCountdown !== null && !currentQuestion && (
            <div className="fixed inset-0 bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 z-50 flex flex-col items-center justify-center">
              <div className="text-center space-y-8">
                <p className="text-2xl text-white/90 font-medium">{t('lecturer.getReady')}</p>
                <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <span className="text-9xl font-bold text-white">{preCountdown}</span>
                </div>
                <p className="text-xl text-white/80">{t('lecturer.firstQuestionStarting')}</p>
              </div>
            </div>
          )}

          {/* Full-screen question view when active */}
          {currentQuestion ? (
            <div className="fixed inset-0 bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 z-50 flex flex-col items-center justify-center p-4 overflow-auto">
              <div className="w-full max-w-4xl space-y-4 py-4">
                {/* Timer */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white/20 backdrop-blur rounded-full">
                    <Clock className="h-6 w-6 text-white" />
                    <span className="text-4xl font-bold text-white">
                      {timeRemaining !== null ? `${timeRemaining}s` : '0s'}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <Card className="bg-white/95 backdrop-blur shadow-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl text-center">{currentQuestion.question}</CardTitle>
                    <CardDescription className="text-center">
                      {currentQuestion.type.replace(/_/g, ' ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => {
                        const letter = String.fromCharCode(65 + index); // A, B, C, D...
                        return (
                          <div
                            key={index}
                            className="p-4 border-2 border-gray-200 rounded-xl hover:border-rose-400 hover:bg-rose-50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">
                                {letter}
                              </div>
                              <span className="flex-1">{option}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Next Button - Show when timer reaches 0 */}
                {timeRemaining === 0 && (
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={async () => {
                        // Show results first if not already shown
                        if (!results) {
                          await handleShowResults(currentQuestion.id);
                          return;
                        }
                        
                        // Find next question
                        const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
                        const nextQuestion = questions[currentIndex + 1];
                        if (nextQuestion) {
                          handleStartQuestion(nextQuestion.id);
                        } else {
                          // No more questions, end session
                          await handleEndSession();
                        }
                      }}
                      className="bg-white text-rose-600 hover:bg-rose-50 text-lg px-8 py-4 h-auto"
                    >
                      {!results 
                        ? t('lecturer.showResults')
                        : questions.findIndex(q => q.id === currentQuestion.id) < questions.length - 1
                        ? t('lecturer.nextQuestion')
                        : t('lecturer.finishSession')}
                    </Button>
                  </div>
                )}

                {/* Scoreboard - Show when results are available */}
                {results && rankings && rankings.length > 0 && (
                  <div className="w-full">
                    <div className="text-center mb-4">
                      <div className="inline-block bg-white/20 backdrop-blur rounded-full px-6 py-2">
                        <span className="text-2xl font-bold text-white">{t('lecturer.leaderboard')}</span>
                      </div>
                    </div>
                    <Scoreboard rankings={rankings} />
                  </div>
                )}

                {/* Stats - Show when results are available */}
                {results && (
                  <Card className="bg-white/95 backdrop-blur shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-xl text-center">{t('lecturer.results')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-3xl font-bold text-rose-600">{results.totalResponses || 0}</p>
                          <p className="text-sm text-muted-foreground mt-1">{t('lecturer.totalResponses')}</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-green-600">{results.correctResponses || 0}</p>
                          <p className="text-sm text-muted-foreground mt-1">{t('lecturer.correct')}</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-blue-600">{Math.round(results.correctnessRate || 0)}%</p>
                          <p className="text-sm text-muted-foreground mt-1">{t('lecturer.accuracy')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-8">
              {session.status === 'ACTIVE' && questions.length > 0 ? (
                <>
                  <div className="px-6 py-3 rounded-full bg-emerald-600 text-emerald-50 text-sm font-medium shadow">
                    {t('lecturer.readyToStart')}
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-lg text-gray-700 text-center">
                      <div>{questions.length} {questions.length === 1 ? t('lecturer.question') : t('lecturer.questions')}</div>
                      <div>{t('lecturer.ready')}</div>
                    </div>
                    {!connected && (
                      <p className="text-sm text-amber-600">{t('lecturer.connecting')}</p>
                    )}
                    <Button
                      onClick={() => handleStartQuestion(questions[0].id)}
                      disabled={!connected || questionsLoading || preCountdown !== null}
                      size="lg"
                      className="bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white px-8 py-6 text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      {questionsLoading ? t('lecturer.loadingQuestions') : t('lecturer.startFirstQuestion')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
              <div className="px-6 py-3 rounded-full bg-rose-600 text-rose-50 text-sm font-medium shadow">
                {t('lecturer.waitingParticipants')}
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-6xl font-bold text-rose-700">
                  {participantCount}
                </p>
                <p className="text-sm text-rose-800">
                  {participantCount === 1 ? t('lecturer.participantJoined') : t('lecturer.participantsJoined')}
                </p>
              </div>
                </>
              )}
              {participantNames && participantNames.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {participantNames
                    // Filter out entries that look like internal IDs (e.g. lecturer user IDs / UUIDs)
                    .filter((name) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name))
                    .map((name, index) => (
                    <div
                      key={`${name}-${index}`}
                        className="min-h-[56px] rounded-xl bg-white/95 border border-rose-100 shadow flex items-center justify-center px-4 py-3 text-sm font-semibold text-rose-800 text-center break-words"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
          </div>
          )}
        </div>
      </div>

      {/* Background music mute/unmute toggle – lecturer screen only */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full shadow-md bg-white/90"
          onClick={() => setIsMuted((prev) => !prev)}
          aria-label={isMuted ? t('lecturer.unmuteMusic') ?? 'Unmute background music' : t('lecturer.muteMusic') ?? 'Mute background music'}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
    </ProtectedRoute>
  );
}

// Quick Add Question Dialog Component
function QuickAddQuestionDialog({ 
  sessionId, 
  onQuestionAdded,
  trigger 
}: { 
  sessionId: string; 
  onQuestionAdded: () => void;
  trigger?: React.ReactNode;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: QuestionType.MULTIPLE_CHOICE,
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    timerSeconds: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const questionData: CreateQuestionDto = {
        type: formData.type,
        question: formData.question,
        options: formData.type !== QuestionType.LONG_ANSWER 
          ? formData.options.filter(o => o.trim()) 
          : undefined,
        correctAnswer: formData.correctAnswer,
        timerSeconds: formData.timerSeconds,
        order: 0, // Will be set by backend
      };

      await api.questions.create(sessionId, questionData);
      toast.success(t('lecturer.questionAdded'));
      onQuestionAdded();
      setOpen(false);
      // Reset form
      setFormData({
        type: QuestionType.MULTIPLE_CHOICE,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        timerSeconds: 30,
      });
    } catch (error) {
      toast.error(t('lecturer.failedAddQuestion'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('lecturer.addQuestion')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('lecturer.addQuestion')}</DialogTitle>
          <DialogDescription>
            {t('lecturer.createQuestionDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">{t('builder.questionType')}</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as QuestionType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionType.MULTIPLE_CHOICE}>{t('builder.multipleChoice')}</SelectItem>
                <SelectItem value={QuestionType.TRUE_FALSE}>{t('builder.trueFalseLabel')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">{t('builder.question')}</Label>
            <Textarea
              id="question"
              placeholder={t('lecturer.enterQuestionPlaceholder')}
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required
            />
          </div>

          {formData.type === QuestionType.MULTIPLE_CHOICE && (
            <div className="space-y-2">
              <Label>{t('lecturer.options')}</Label>
              {formData.options.map((option, index) => (
                <Input
                  key={index}
                  placeholder={`${t('lecturer.option')} ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = e.target.value;
                    setFormData({ ...formData, options: newOptions });
                  }}
                />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="correctAnswer">{t('lecturer.correctAnswer')}</Label>
            <Input
              id="correctAnswer"
              placeholder={t('lecturer.enterCorrectAnswer')}
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timer">{t('builder.timeLimit')}</Label>
            <Input
              id="timer"
              type="number"
              min="10"
              max="300"
              value={formData.timerSeconds}
              onChange={(e) => setFormData({ ...formData, timerSeconds: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              {t('lecturer.addQuestion')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

