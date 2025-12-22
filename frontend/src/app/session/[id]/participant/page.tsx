'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Session, Question, QuestionType } from '@/types/api';
import { Clock, CheckCircle, XCircle, Trophy, Award, Target, TrendingUp } from 'lucide-react';

export default function ParticipantSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<number | null>(null); // Store index instead of text
  const [multiSelectResponse, setMultiSelectResponse] = useState<number[]>([]); // Store indices
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [userResponseCorrect, setUserResponseCorrect] = useState<boolean | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [participantStats, setParticipantStats] = useState<{
    rank: number | null;
    totalParticipants: number;
    totalQuestions: number;
    totalResponses: number;
    correctCount: number;
    wrongCount: number;
    accuracy: number;
    points: number;
  } | null>(null);

  // Socket.IO only for receiving broadcasts
  const {
    connected,
    currentQuestion,
    timeRemaining,
    results,
    preCountdown,
    socket,
  } = useSocket({ sessionCode: session?.code, role: 'student', autoConnect: true });

  useEffect(() => {
    loadSession();
    // Load nickname from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`thinktap-nickname-${sessionId}`);
      setNickname(stored);
    }
  }, [sessionId]);

  // Join session via HTTP endpoint when both session and nickname are available
  const hasJoinedRef = useRef(false);
  useEffect(() => {
    const joinSession = async () => {
      if (session?.id && nickname && connected && socket && !hasJoinedRef.current) {
        try {
          console.log('[Participant] Joining session via HTTP:', session.id, nickname);
          hasJoinedRef.current = true;
          
          // Join via HTTP endpoint
          const result = await api.sessions.join(session.id, {
            nickname,
            role: 'student',
          });
          
          console.log('[Participant] Joined session:', result);
          
          // After HTTP join, join Socket.IO room for broadcasts
          if (socket) {
            socket.emit('join_room', {
              sessionId: session.id,
              nickname,
              role: 'student',
            });
          }
        } catch (error: any) {
          console.error('[Participant] Failed to join session:', error);
          toast.error(error?.response?.data?.message || 'Failed to join session');
          hasJoinedRef.current = false;
        }
      }
    };

    void joinSession();
  }, [session?.id, nickname, connected, socket]);

  // Debug: Log when currentQuestion changes
  useEffect(() => {
    if (currentQuestion) {
      console.log('[Participant] currentQuestion updated:', currentQuestion.id, currentQuestion.question);
    } else {
      console.log('[Participant] currentQuestion is null');
    }
  }, [currentQuestion]);

  // Debug: Log socket connection and events
  useEffect(() => {
    if (socket) {
      console.log('Participant socket connected:', connected);
      console.log('Participant session code:', session?.code);
      console.log('Participant nickname:', nickname);
      console.log('Participant currentQuestion:', currentQuestion);
      
      // Log all socket events for debugging
      const originalEmit = socket.emit.bind(socket);
      socket.emit = function(...args: any[]) {
        console.log('Participant emitting:', args[0], args[1]);
        return originalEmit(...args);
      };
      
      // Don't add duplicate listeners - useSocket hook already handles these events
      // Just log for debugging
      const handleSessionJoined = (data: any) => {
        console.log('[Participant] session_joined event received:', data);
      };
      
      socket.on('session_joined', handleSessionJoined);
      
      return () => {
        socket.off('session_joined', handleSessionJoined);
      };
    }
  }, [socket, connected, session?.code, nickname, currentQuestion]);

  // Listen for session ended event
  useEffect(() => {
    if (!socket) return;

    const handleSessionEnded = async (data: { message: string; leaderboard?: any }) => {
      console.log('Session ended, fetching participant stats...');
      setSessionEnded(true);
      
      // Fetch participant stats
      try {
        const stats = await api.responses.getParticipantStats(sessionId, {
          nickname: nickname || undefined,
        });
        setParticipantStats(stats);
      } catch (error) {
        console.error('Error fetching participant stats:', error);
        toast.error('Failed to load your results');
      }
    };

    socket.on('session_ended', handleSessionEnded);

    return () => {
      socket.off('session_ended', handleSessionEnded);
    };
  }, [socket, sessionId, nickname]);

  useEffect(() => {
    if (currentQuestion) {
      setResponse(null);
      setMultiSelectResponse([]);
      setResponseSubmitted(false);
      setStartTime(Date.now());
      setUserResponseCorrect(null);
    }
  }, [currentQuestion]);

  // Calculate if user's response was correct when results are shown
  useEffect(() => {
    if (results && currentQuestion && response !== null) {
      const correctAnswer = currentQuestion.correctAnswer;
      
      let isCorrect = false;
      if (currentQuestion.type === QuestionType.MULTIPLE_SELECT) {
        // Compare indices directly
        if (Array.isArray(correctAnswer) && correctAnswer.length > 0 && typeof correctAnswer[0] === 'number') {
          // New format: indices
          const userIndices = [...multiSelectResponse].sort((a, b) => a - b);
          const correctIndices = [...correctAnswer].sort((a, b) => a - b);
          isCorrect = JSON.stringify(userIndices) === JSON.stringify(correctIndices);
        } else {
          // Old format: text comparison (fallback)
          const userAnswers = multiSelectResponse.map(i => currentQuestion.options?.[i]).filter(Boolean);
          const userAnswersSorted = [...userAnswers].sort();
          const correctAnswers = Array.isArray(correctAnswer) ? [...correctAnswer].sort() : [];
          isCorrect = JSON.stringify(userAnswersSorted) === JSON.stringify(correctAnswers);
        }
      } else {
        // For MULTIPLE_CHOICE and TRUE_FALSE, compare indices
        if (typeof correctAnswer === 'number') {
          // New format: index
          isCorrect = response === correctAnswer;
        } else {
          // Old format: text comparison (fallback)
          const userAnswer = currentQuestion.options?.[response];
          isCorrect = userAnswer === correctAnswer || 
            (currentQuestion.type === QuestionType.TRUE_FALSE && 
             ((userAnswer === 'True' && correctAnswer === 'true') ||
              (userAnswer === 'False' && correctAnswer === 'false')));
        }
      }
      setUserResponseCorrect(isCorrect);
    }
  }, [results, currentQuestion, response, multiSelectResponse]);

  const loadSession = async () => {
    try {
      const data = await api.sessions.getById(sessionId);
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || responseSubmitted) return;

    let finalResponse: any;
    if (currentQuestion.type === QuestionType.MULTIPLE_SELECT) {
      // Submit indices directly (array of numbers)
      if (multiSelectResponse.length === 0) {
        toast.error('Please select at least one answer');
        return;
      }
      finalResponse = multiSelectResponse; // Already indices
    } else {
      // Submit index directly (number) instead of converting to text
      if (response === null || response === undefined) {
      toast.error('Please select an answer');
      return;
      }
      finalResponse = response; // Submit the index (number) directly
    }

    console.log('[Participant] Submitting response:', {
      questionId: currentQuestion.id,
      response: finalResponse,
      responseType: typeof finalResponse,
      isArray: Array.isArray(finalResponse),
    });

    const responseTimeMs = startTime ? Date.now() - startTime : 0;

    try {
      // Submit via HTTP endpoint
      await api.responses.submit(sessionId, {
        questionId: currentQuestion.id,
        response: finalResponse, // Sending index(es) instead of text
      responseTimeMs,
        nickname: nickname || undefined,
    });

    setResponseSubmitted(true);
    toast.success('Response submitted!');
    } catch (error: any) {
      console.error('[Participant] Failed to submit response:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit response');
    }
  };

  // Check if response is valid for button enable/disable
  const hasValidResponse = () => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === QuestionType.MULTIPLE_SELECT) {
      return multiSelectResponse.length > 0;
    }
    return response !== null && response !== undefined;
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <RadioGroup value={response} onValueChange={setResponse}>
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case QuestionType.TRUE_FALSE:
        return (
          <RadioGroup value={response} onValueChange={setResponse}>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        );

      case QuestionType.MULTIPLE_SELECT:
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={`option-${index}`}
                  checked={multiSelectResponse.includes(index)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setMultiSelectResponse([...multiSelectResponse, index]);
                    } else {
                      setMultiSelectResponse(multiSelectResponse.filter(i => i !== index));
                    }
                  }}
                />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case QuestionType.LONG_ANSWER:
        return (
          <Textarea
            placeholder="Type your answer..."
            value={response || ''}
            onChange={(e) => setResponse(e.target.value)}
            disabled={responseSubmitted}
            rows={6}
          />
        );

      default:
        return null;
    }
  };

  // Show full-screen countdown when pre_countdown event is received
  if (preCountdown !== null && !currentQuestion) {
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

  // Show dashboard if session ended
  if (sessionEnded && participantStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <Card className="bg-white/95 backdrop-blur shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Trophy className="h-16 w-16 text-amber-500" />
              </div>
              <CardTitle className="text-3xl font-bold">Session Complete!</CardTitle>
              <CardDescription className="text-lg">
                {nickname ? `Great job, ${nickname}!` : 'Great job!'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ranking */}
              {participantStats.rank && (
                <div className="text-center p-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Award className="h-8 w-8 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-800">
                      Rank #{participantStats.rank}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Out of {participantStats.totalParticipants} participants
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-green-700">{participantStats.correctCount}</p>
                    <p className="text-sm text-gray-600 mt-1">Correct</p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-4 text-center">
                    <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-red-700">{participantStats.wrongCount}</p>
                    <p className="text-sm text-gray-600 mt-1">Wrong</p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 text-center">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-blue-700">{participantStats.accuracy.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600 mt-1">Accuracy</p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4 text-center">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-purple-700">{participantStats.points}</p>
                    <p className="text-sm text-gray-600 mt-1">Points</p>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  You answered <span className="font-bold">{participantStats.totalResponses}</span> out of{' '}
                  <span className="font-bold">{participantStats.totalQuestions}</span> questions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // Full-screen question view - matching lecturer view
  if (currentQuestion) {
    return (
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
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-center">{currentQuestion.question}</CardTitle>
              <CardDescription className="text-center text-sm">
                {currentQuestion.type.replace(/_/g, ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                {currentQuestion.options?.map((option, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D...
                  
                  // Determine if this option is selected by index
                  let isSelected = false;
                  if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE || currentQuestion.type === QuestionType.TRUE_FALSE) {
                    // For single select, compare by index
                    isSelected = response === index;
                  } else if (currentQuestion.type === QuestionType.MULTIPLE_SELECT) {
                    // For multiple select, check if index is in array
                    isSelected = multiSelectResponse.includes(index);
                  }

                  // Determine if this is the correct answer (when results are shown or timer ended)
                  // Check if timer has ended (0 or null) or results are shown
                  const showAnswer = (timeRemaining === 0 || timeRemaining === null) || results;
                  let isCorrectAnswer = false;
                  
                  // Debug logging
                  if (index === 0 && showAnswer) {
                    console.log('[Participant] Checking correct answer:', {
                      correctAnswer: currentQuestion.correctAnswer,
                      correctAnswerType: typeof currentQuestion.correctAnswer,
                      showAnswer,
                      timeRemaining,
                      results: !!results,
                    });
                  }
                  
                  if (showAnswer && currentQuestion.correctAnswer !== null && currentQuestion.correctAnswer !== undefined) {
                    if (currentQuestion.type === QuestionType.MULTIPLE_SELECT) {
                      // For multiple select, check if this index is in the correct answers array
                      if (Array.isArray(currentQuestion.correctAnswer) && 
                          currentQuestion.correctAnswer.length > 0 && 
                          typeof currentQuestion.correctAnswer[0] === 'number') {
                        // New format: indices
                        isCorrectAnswer = currentQuestion.correctAnswer.includes(index);
                      } else {
                        // Old format: text comparison (fallback)
                        const correctAnswers = Array.isArray(currentQuestion.correctAnswer) 
                          ? currentQuestion.correctAnswer 
                          : [currentQuestion.correctAnswer];
                        isCorrectAnswer = correctAnswers.includes(option);
                      }
                    } else {
                      // For single select (MULTIPLE_CHOICE or TRUE_FALSE), compare by index
                      if (typeof currentQuestion.correctAnswer === 'number') {
                        // New format: index (0=A, 1=B, 2=C, 3=D)
                        isCorrectAnswer = currentQuestion.correctAnswer === index;
                        // Debug for option B (index 1)
                        if (index === 1 && showAnswer) {
                          console.log(`[Participant] Option B check: correctAnswer=${currentQuestion.correctAnswer}, index=${index}, isCorrect=${isCorrectAnswer}`);
                        }
                      } else {
                        // Old format: text comparison (fallback)
                        // Try to match by option text or by letter (A, B, C, D)
                        const letter = String.fromCharCode(65 + index); // A, B, C, D
                        isCorrectAnswer = currentQuestion.correctAnswer === option || 
                          currentQuestion.correctAnswer === letter ||
                          currentQuestion.correctAnswer?.toString().toUpperCase() === letter ||
                          (currentQuestion.type === QuestionType.TRUE_FALSE && 
                           ((option === 'True' && currentQuestion.correctAnswer === 'true') ||
                            (option === 'False' && currentQuestion.correctAnswer === 'false')));
                      }
                    }
                  }

                  // Determine if user's answer was correct
                  const userAnswerCorrect = showAnswer && isSelected && isCorrectAnswer;
                  const userAnswerWrong = showAnswer && isSelected && !isCorrectAnswer;
                  
                  // Debug: Log correct answer detection for option B
                  if (index === 1 && showAnswer) {
                    console.log(`[Participant] Option B (index 1) - isCorrectAnswer: ${isCorrectAnswer}, showAnswer: ${showAnswer}, isSelected: ${isSelected}`);
                  }
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (responseSubmitted || timeRemaining === 0) return;
                        
                        if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE || currentQuestion.type === QuestionType.TRUE_FALSE) {
                          // For single select, store the index
                          setResponse(index);
                        } else if (currentQuestion.type === QuestionType.MULTIPLE_SELECT) {
                          // For multiple select, toggle the index
                          if (multiSelectResponse.includes(index)) {
                            setMultiSelectResponse(multiSelectResponse.filter(i => i !== index));
                          } else {
                            setMultiSelectResponse([...multiSelectResponse, index]);
                          }
                        }
                      }}
                      disabled={responseSubmitted || timeRemaining === 0}
                      className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                        userAnswerCorrect
                          ? 'border-green-500 bg-green-100 shadow-lg'
                          : userAnswerWrong
                          ? 'border-red-500 bg-red-100 shadow-lg'
                          : isCorrectAnswer && showAnswer
                          ? 'border-green-500 bg-green-100 shadow-lg'
                          : isSelected
                          ? 'border-rose-500 bg-rose-100 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-rose-400 hover:bg-rose-50'
                      } ${responseSubmitted || timeRemaining === 0 ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          userAnswerCorrect
                            ? 'bg-green-600 text-white'
                            : userAnswerWrong
                            ? 'bg-red-600 text-white'
                            : isCorrectAnswer && showAnswer
                            ? 'bg-green-500 text-white'
                            : isSelected 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {letter}
                        </div>
                        <span className="flex-1 text-sm">{option}</span>
                        {/* Show correct answer tick when timer ends or results shown */}
                        {showAnswer && isCorrectAnswer && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-green-600">Correct</span>
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                        )}
                        {/* Show wrong answer mark if user selected wrong answer */}
                        {userAnswerWrong && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-red-600">Wrong</span>
                            <XCircle className="h-6 w-6 text-red-600" />
                          </div>
                        )}
                        {/* Show selected indicator before results */}
                        {isSelected && !showAnswer && (
                          <CheckCircle className="h-5 w-5 text-rose-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={responseSubmitted || timeRemaining === 0 || !hasValidResponse()}
                className="w-full h-12 text-base mt-4"
                size="lg"
              >
                {responseSubmitted ? (
                  <>
                    <CheckCircle className="mr-2 h-6 w-6" />
                    Submitted ✓
                  </>
                ) : (
                  'Submit Answer'
                )}
              </Button>

              {responseSubmitted && (
                <div className="text-center text-green-600 font-medium mt-3">
                  ✓ Your response has been recorded. Waiting for others...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Display - Show after timer ends */}
          {results && (
            <Card className="bg-white/95 backdrop-blur shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-center">Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-rose-600">{results.totalResponses}</p>
                    <p className="text-xs text-muted-foreground">Responses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{results.correctResponses}</p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(results.correctnessRate)}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="container mx-auto max-w-3xl py-8">
        {/* Session Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Session {session?.code}</CardTitle>
                <CardDescription>
                  {connected ? 'Connected' : 'Disconnected'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Results or Waiting */}
        {results ? (
          // Results Display
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold">{results.totalResponses}</p>
                    <p className="text-sm text-muted-foreground">Responses</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {results.correctResponses}
                    </p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">
                      {Math.round(results.correctnessRate)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>

                {/* Response Distribution */}
                {Object.entries(results.responseDistribution).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Response Distribution</h4>
                    {Object.entries(results.responseDistribution).map(([answer, count], index) => {
                      const percentage = (count / results.totalResponses) * 100;
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{answer.replace(/"/g, '')}</span>
                            <span className="font-medium">{count} ({Math.round(percentage)}%)</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-600 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Waiting State
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Spinner size="lg" className="mx-auto" />
                <div>
                  <p className="text-lg font-medium">Waiting for next question...</p>
                  <p className="text-sm text-muted-foreground">
                    Your lecturer will start the next question soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

