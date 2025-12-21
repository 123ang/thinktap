'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSocket, useAuth, useQuestions } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { SessionStatus, ModeStatus } from '@/components/SessionStatus';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Session, CreateQuestionDto, QuestionType } from '@/types/api';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Play, 
  Square, 
  BarChart,
  Copy,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
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

export default function LecturerSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { user } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [quizTitle, setQuizTitle] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  
  const { questions, createQuestion, refresh: refreshQuestions } = useQuestions(sessionId);
  const {
    connected,
    participantCount,
    participantNames,
    currentQuestion,
    timeRemaining,
    results,
    startQuestion,
    showResults,
    endSession,
  } = useSocket({ sessionCode: session?.code, role: 'lecturer' });

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Load quiz title from localStorage (saved in builder) so host-live screen can show it
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedTitle = localStorage.getItem(`thinktap-title-${sessionId}`);
    if (storedTitle) {
      setQuizTitle(storedTitle);
    }
    // Build join URL for QR code
    const origin = window.location.origin;
    setJoinUrl(`${origin}/session/${sessionId}/join`);
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const data = await api.sessions.getById(sessionId);
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.code);
      setCodeCopied(true);
      toast.success('Session code copied!');
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleStartSession = async () => {
    try {
      await api.sessions.updateStatus(sessionId, 'ACTIVE');
      await loadSession();
      toast.success('Session started!');
    } catch (error) {
      toast.error('Failed to start session');
    }
  };

  const handleEndSession = async () => {
    try {
      await api.sessions.updateStatus(sessionId, 'ENDED');
      endSession();
      toast.success('Session ended');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  };

  const handleStartQuestion = (questionId: string) => {
    startQuestion(sessionId, questionId);
    toast.success('Question started!');
  };

  const handleShowResults = (questionId: string) => {
    showResults(sessionId, questionId);
  };

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
                  Back
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold pb-1">
                    {quizTitle || `Quiz ${session.code}`}
                  </h1>
                  <SessionStatus status={session.status} />
                  <ModeStatus mode={session.mode} />
                </div>
                <p className="text-sm text-rose-50/90">
                  {connected ? 'Connected' : 'Disconnected'} • {participantCount} participants
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session.status === 'CREATED' && (
                <Button
                  onClick={handleStartSession}
                  className="bg-emerald-500 hover:bg-emerald-600 text-emerald-50"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Session
                </Button>
              )}
              {session.status === 'ACTIVE' && (
                <Button
                  variant="destructive"
                  onClick={handleEndSession}
                  className="bg-rose-800 hover:bg-rose-900 text-rose-50"
                >
                  <Square className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              )}
              {session.status === 'ENDED' && user?.plan !== 'FREE' && (
                <Link href={`/session/${sessionId}/insights`}>
                  <Button
                    variant="outline"
                    className="bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-300"
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    View Insights
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
                Game PIN
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
                    alt="Join quiz QR code"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="text-xs text-rose-700 max-w-xs">
                  Students can scan the QR code or visit the join link to enter the PIN and nickname.
                </div>
              </div>
            )}
          </div>

          {/* Lobby view: show while no question is currently active */}
          {!currentQuestion ? (
            <div className="flex flex-col items-center justify-center py-10 gap-8">
              <div className="px-6 py-3 rounded-full bg-rose-600 text-rose-50 text-sm font-medium shadow">
                Waiting for participants
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-6xl font-bold text-rose-700">
                  {participantCount}
                </p>
                <p className="text-sm text-rose-800">
                  {participantCount === 1 ? 'participant joined' : 'participants joined'}
                </p>
              </div>
              {participantNames && participantNames.length > 0 && (
                <div className="mt-6 grid grid-cols-6 gap-4">
                  {participantNames.map((name, index) => (
                    <div
                      key={`${name}-${index}`}
                      className="w-[250px] min-h-[50px] rounded-xl bg-white/95 border border-rose-100 shadow flex items-center justify-center px-3 py-2 text-sm font-semibold text-rose-800 text-center break-words"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Session Info */}
            <div className="space-y-6">
              {/* Session Code Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Code</CardTitle>
                  <CardDescription>Share this code with participants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-center py-4 bg-red-50 rounded-lg">
                      <p className="text-4xl font-mono font-bold text-red-600">
                        {session.code}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyCode}
                    >
                      {codeCopied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Participants Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-red-600">{participantCount}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {participantCount === 1 ? 'participant' : 'participants'} joined
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Current Question Status */}
              {currentQuestion && (
                <Card>
                  <CardHeader>
                    <CardTitle>Active Question</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium mb-2">{currentQuestion.question}</p>
                    {timeRemaining !== null && (
                      <div className="text-center py-4 bg-orange-50 rounded-lg">
                        <p className="text-3xl font-bold text-orange-600">
                          {timeRemaining}s
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Questions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>
                      {questions.length} question{questions.length !== 1 ? 's' : ''} added
                    </CardDescription>
                  </div>
                  <QuickAddQuestionDialog 
                    sessionId={sessionId}
                    onQuestionAdded={refreshQuestions}
                  />
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No questions yet</p>
                      <p className="text-sm text-muted-foreground mb-6">
                        Add your first question to get started
                      </p>
                      <QuickAddQuestionDialog 
                        sessionId={sessionId}
                        onQuestionAdded={refreshQuestions}
                        trigger={
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Question
                          </Button>
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Q{index + 1}
                                </span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {question.type.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="font-medium mb-2">{question.question}</p>
                              {question.options && (
                                <div className="text-sm text-muted-foreground">
                                  {question.options.length} options
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {session.status === 'ACTIVE' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStartQuestion(question.id)}
                                    disabled={currentQuestion?.id === question.id}
                                  >
                                    <Play className="mr-2 h-4 w-4" />
                                    Start
                                  </Button>
                                  {currentQuestion?.id === question.id && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleShowResults(question.id)}
                                    >
                                      Show Results
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results Display */}
              {results && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{results.totalResponses}</p>
                          <p className="text-sm text-muted-foreground">Responses</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {results.correctResponses}
                          </p>
                          <p className="text-sm text-muted-foreground">Correct</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {Math.round(results.correctnessRate)}%
                          </p>
                          <p className="text-sm text-muted-foreground">Accuracy</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          )}
        </div>
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
      toast.success('Question added!');
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
      toast.error('Failed to add question');
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
            Add Question
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>
            Create a new question for your session
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Question Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as QuestionType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="Enter your question..."
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required
            />
          </div>

          {formData.type === QuestionType.MULTIPLE_CHOICE && (
            <div className="space-y-2">
              <Label>Options</Label>
              {formData.options.map((option, index) => (
                <Input
                  key={index}
                  placeholder={`Option ${index + 1}`}
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
            <Label htmlFor="correctAnswer">Correct Answer</Label>
            <Input
              id="correctAnswer"
              placeholder="Enter correct answer..."
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timer">Timer (seconds)</Label>
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
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Add Question
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

