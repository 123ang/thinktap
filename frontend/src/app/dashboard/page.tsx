'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Quiz, Session } from '@/types/api';
import { Plus, BarChart } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
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
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to load quizzes';
      console.error('Error details:', errorMessage);
      // Show error to user (but not for auth issues which will redirect)
      if (error?.response?.status !== 401) {
        // Don't show error toast for network errors to avoid spam, just log
        if (!error?.message?.includes('Unable to connect to server')) {
          console.error('Quiz loading error:', errorMessage);
        }
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
        total: data.totalSessions || quizzes.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to quiz count if analytics fails
      setStats({
        total: quizzes.length,
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const confirmed = window.confirm(t('dashboard.deleteConfirm'));
    if (!confirmed) return;

    try {
      await api.quizzes.delete(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      setStats((prev) => ({
        total: Math.max(0, prev.total - 1),
      }));
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      CREATED: { variant: 'secondary', label: t('common.created') || 'Created' },
      ACTIVE: { variant: 'default', label: t('common.active') || 'Active' },
      ENDED: { variant: 'outline', label: t('common.ended') || 'Ended' },
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
              <h1 className="text-2xl font-bold pb-1">{t('dashboard.title')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.welcome')} {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="text-right">
                <p className="text-sm font-medium">{t('dashboard.plan')} {user?.plan}</p>
                {user?.plan === 'FREE' && (
                  <Link 
                    href="/upgrade" 
                    className="text-xs text-red-600 hover:underline"
                  >
                    {t('dashboard.upgrade')}
                  </Link>
                )}
              </div>
              <Button variant="outline" onClick={logout}>
                {t('dashboard.signOut')}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.totalQuizzes')}
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-orange-600 text-white">
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.create')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/quiz/create">
                  <Button className="w-full bg-white text-red-600 hover:bg-gray-100">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('dashboard.thinktap')}
                  </Button>
                </Link>
                <p className="mt-3 text-xs text-red-50">
                  {t('dashboard.thinktapDesc')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Projects / Quizzes List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.yourQuizzes')}</CardTitle>
                <CardDescription>{t('dashboard.manageQuizzes')}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/reports">
                  <Button size="sm" variant="outline">
                    <BarChart className="mr-2 h-4 w-4" />
                    {t('dashboard.viewReports')}
                  </Button>
                </Link>
                <Link href="/quiz/create">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('dashboard.newQuiz')}
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
                  <p className="text-muted-foreground mb-4">{t('dashboard.noQuizzes')}</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t('dashboard.createFirst')}
                  </p>
                  <Link href="/quiz/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('dashboard.createFirstQuiz')}
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
                              {quiz.title || t('dashboard.untitledQuiz')}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {t('dashboard.questions')} {quiz._count?.questions || 0}
                            </span>
                            <span>
                              {t('dashboard.sessions')} {quiz._count?.sessions || 0}
                            </span>
                            <span>
                              {t('dashboard.updated')} {new Date(quiz.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/host/${quiz.id}`} target="_blank">
                            <Button size="sm" variant="outline">
                              {t('dashboard.hostLive')}
                            </Button>
                          </Link>
                          <Link href={`/quiz/create?quizId=${quiz.id}`}>
                            <Button size="sm" variant="outline">
                              {t('dashboard.edit')}
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            {t('dashboard.delete')}
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
