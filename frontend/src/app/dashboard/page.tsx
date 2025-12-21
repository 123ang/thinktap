'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Quiz, Session } from '@/types/api';
import { Plus, Users, Clock, BarChart, History } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    ended: 0,
  });

  useEffect(() => {
    loadQuizzes();
    loadStats();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await api.quizzes.getAll();
      console.log('Loaded quizzes:', data);
      setQuizzes(data);
    } catch (error: any) {
      console.error('Error loading quizzes:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to load quizzes';
      console.error('Error details:', errorMessage);
      // Show error to user
      if (error?.response?.status !== 401) {
        // Don't show error for auth issues (will redirect)
        setQuizzes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.analytics.getDashboard();
      setStats({
        total: data.totalSessions,
        active: data.recentSessions.filter((s) => s.status === 'ACTIVE').length,
        ended: data.recentSessions.filter((s) => s.status === 'ENDED').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this quiz? This cannot be undone.');
    if (!confirmed) return;

    try {
      await api.quizzes.delete(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      CREATED: { variant: 'secondary', label: 'Created' },
      ACTIVE: { variant: 'default', label: 'Active' },
      ENDED: { variant: 'outline', label: 'Ended' },
    };
    const config = variants[status] || variants.CREATED;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getModeBadge = (mode: string) => {
    const colors: Record<string, string> = {
      RUSH: 'bg-red-100 text-red-800',
      THINKING: 'bg-orange-100 text-orange-800',
      SEMINAR: 'bg-green-100 text-green-800',
    };
    return (
      <Badge className={colors[mode] || 'bg-gray-100 text-gray-800'}>
        {mode}
      </Badge>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold pb-1">ThinkTap Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Plan: {user?.plan}</p>
                {user?.plan === 'FREE' && (
                  <Link 
                    href="/upgrade" 
                    className="text-xs text-red-600 hover:underline"
                  >
                    Upgrade to Pro
                  </Link>
                )}
              </div>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Quizzes
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Now
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ended}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-orange-600 text-white">
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Create
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/quiz/create">
                  <Button className="w-full bg-white text-red-600 hover:bg-gray-100">
                    <Plus className="mr-2 h-4 w-4" />
                    ThinkTap
                  </Button>
                </Link>
                <p className="mt-3 text-xs text-red-50">
                  Short interactive lessons with quizzes.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Projects / Quizzes List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Quizzes</CardTitle>
                <CardDescription>Manage and view your ThinkTap quizzes</CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/quiz/create">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Quiz
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No quizzes yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create your first quiz to get started
                  </p>
                  <Link href="/quiz/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Quiz
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {quiz.title || 'Untitled Quiz'}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Questions: {quiz._count?.questions || 0}
                            </span>
                            <span>
                              Sessions: {quiz._count?.sessions || 0}
                            </span>
                            <span>
                              Updated: {new Date(quiz.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/host/${quiz.id}`} target="_blank">
                            <Button size="sm" variant="outline">
                              Host live
                            </Button>
                          </Link>
                          <Link href={`/quiz/create?quizId=${quiz.id}`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/quiz/${quiz.id}/history`}>
                            <Button size="sm" variant="outline">
                              <History className="mr-2 h-4 w-4" />
                              History
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
