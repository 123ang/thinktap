'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAnalytics, useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { SessionStatus, ModeStatus } from '@/components/SessionStatus';
import { ResponseDistributionChart } from '@/components/charts/ResponseDistributionChart';
import { CorrectnessChart } from '@/components/charts/CorrectnessChart';
import { ResponseTimeChart } from '@/components/charts/ResponseTimeChart';
import { Leaderboard } from '@/components/charts/Leaderboard';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Clock,
  Target,
  TrendingUp,
  BarChart
} from 'lucide-react';
import Link from 'next/link';

export default function SessionInsightsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.id as string;
  
  const { insights, loading, loadSessionInsights } = useAnalytics(sessionId);

  useEffect(() => {
    if (!sessionId) return;
    loadSessionInsights(sessionId);
  }, [sessionId]);

  useEffect(() => {
    // Check if user has access to insights
    if (user?.plan === 'FREE') {
      toast.error('Insights are only available on paid plans');
      router.push('/dashboard');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!insights) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p>No insights available</p>
        </div>
      </ProtectedRoute>
    );
  }

  const responseTimeData = insights.questions.map((q, index) => ({
    questionNumber: index + 1,
    avgTime: q.avgResponseTimeMs,
    fastestTime: q.fastestResponseMs,
    slowestTime: q.slowestResponseMs,
  }));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold pb-1">Session Insights</h1>
                    <Badge variant="outline" className="font-mono">{insights.code}</Badge>
                    <SessionStatus status={insights.status} />
                    <ModeStatus mode={insights.mode} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive analytics for your session
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.totalQuestions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Responses</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.totalResponses}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.totalParticipants}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Correctness</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(insights.avgCorrectness)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(insights.avgResponseTime)}ms
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              {insights.mode === 'RUSH' && insights.leaderboard && (
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              )}
              {insights.participantEngagement && (
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
              )}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overall Correctness */}
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Correctness</CardTitle>
                    <CardDescription>Distribution of correct and incorrect responses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CorrectnessChart
                      correct={insights.questions.reduce((sum, q) => sum + q.correctResponses, 0)}
                      incorrect={insights.questions.reduce((sum, q) => sum + q.incorrectResponses, 0)}
                    />
                  </CardContent>
                </Card>

                {/* Response Time Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Response Time Analysis</CardTitle>
                    <CardDescription>Average response time per question</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponseTimeChart data={responseTimeData} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-6">
              {insights.questions.map((question, index) => (
                <Card key={question.questionId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>Q{index + 1}</Badge>
                          <Badge variant="outline">{question.type}</Badge>
                        </div>
                        <CardTitle className="text-lg">{question.question}</CardTitle>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(question.correctnessRate)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Stats */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Responses</p>
                            <p className="text-2xl font-bold">{question.totalResponses}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Correct</p>
                            <p className="text-2xl font-bold text-green-600">
                              {question.correctResponses}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Incorrect</p>
                            <p className="text-2xl font-bold text-red-600">
                              {question.incorrectResponses}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Time</p>
                            <p className="text-xl font-bold">{question.avgResponseTimeMs}ms</p>
                          </div>
                          {question.fastestResponseMs && (
                            <div>
                              <p className="text-sm text-muted-foreground">Fastest</p>
                              <p className="text-xl font-bold text-green-600">
                                {question.fastestResponseMs}ms
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Response Distribution */}
                      <div>
                        <h4 className="font-medium mb-4">Response Distribution</h4>
                        <ResponseDistributionChart data={question.responseDistribution} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Leaderboard Tab */}
            {insights.mode === 'RUSH' && insights.leaderboard && (
              <TabsContent value="leaderboard">
                <Leaderboard entries={insights.leaderboard} />
              </TabsContent>
            )}

            {/* Engagement Tab */}
            {insights.participantEngagement && (
              <TabsContent value="engagement">
                <Card>
                  <CardHeader>
                    <CardTitle>Participant Engagement</CardTitle>
                    <CardDescription>Individual performance and participation metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights.participantEngagement.map((participant, index) => (
                        <div
                          key={participant.userId || index}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-medium">
                                {participant.email || `Participant ${index + 1}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {participant.totalResponses} responses
                              </p>
                            </div>
                            <Badge variant="outline" className="text-lg">
                              Score: {Math.round(participant.engagementScore)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Correct</p>
                              <p className="font-bold text-green-600">
                                {participant.correctResponses}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Participation</p>
                              <p className="font-bold">
                                {Math.round(participant.participationRate)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg Time</p>
                              <p className="font-bold">{participant.avgResponseTimeMs}ms</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Engagement</p>
                              <p className="font-bold text-red-600">
                                {Math.round(participant.engagementScore)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}

