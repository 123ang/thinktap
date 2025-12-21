'use client';

import { useEffect, useState } from 'react';
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
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ParticipantSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<any>(null);
  const [multiSelectResponse, setMultiSelectResponse] = useState<string[]>([]);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const {
    connected,
    currentQuestion,
    timeRemaining,
    results,
    submitResponse,
    joinSession,
  } = useSocket();

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (session) {
      joinSession(session.code);
    }
  }, [session]);

  useEffect(() => {
    if (currentQuestion) {
      setResponse(null);
      setMultiSelectResponse([]);
      setResponseSubmitted(false);
      setStartTime(Date.now());
    }
  }, [currentQuestion]);

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

  const handleSubmit = () => {
    if (!currentQuestion || responseSubmitted) return;

    let finalResponse = response;
    if (currentQuestion.type === QuestionType.MULTIPLE_SELECT) {
      finalResponse = multiSelectResponse;
    }

    if (!finalResponse || (Array.isArray(finalResponse) && finalResponse.length === 0)) {
      toast.error('Please select an answer');
      return;
    }

    const responseTimeMs = startTime ? Date.now() - startTime : 0;

    submitResponse({
      sessionId,
      questionId: currentQuestion.id,
      response: finalResponse,
      responseTimeMs,
    });

    setResponseSubmitted(true);
    toast.success('Response submitted!');
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
                  checked={multiSelectResponse.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setMultiSelectResponse([...multiSelectResponse, option]);
                    } else {
                      setMultiSelectResponse(multiSelectResponse.filter(o => o !== option));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="lg" />
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
              {timeRemaining !== null && timeRemaining > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">
                    {timeRemaining}s
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Question Display */}
        {currentQuestion ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
              <CardDescription>
                {currentQuestion.type.replace(/_/g, ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQuestionInput()}

              <Button
                onClick={handleSubmit}
                disabled={responseSubmitted || timeRemaining === 0}
                className="w-full h-12"
                size="lg"
              >
                {responseSubmitted ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Submitted
                  </>
                ) : (
                  'Submit Answer'
                )}
              </Button>

              {responseSubmitted && (
                <div className="text-center text-green-600 font-medium">
                  ✓ Your response has been recorded
                </div>
              )}
            </CardContent>
          </Card>
        ) : results ? (
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

