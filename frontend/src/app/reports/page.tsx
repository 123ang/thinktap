'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { 
  Search, 
  MoreVertical, 
  Trash2, 
  RotateCcw,
  FileText,
  Users,
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface Report {
  id: string;
  code: string;
  status: string;
  mode: string;
  createdAt: string;
  endedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  quiz: {
    id: string;
    title: string;
  } | null;
  participantCount: number;
  _count: {
    responses: number;
  };
}

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'all' | 'trash'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantSearchQuery, setParticipantSearchQuery] = useState('');
  const [participantSortBy, setParticipantSortBy] = useState<'rank' | 'nickname' | 'score' | 'correct'>('rank');
  const [participantSortOrder, setParticipantSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [questionSortBy, setQuestionSortBy] = useState<'question' | 'type' | 'correct'>('question');
  const [questionSortOrder, setQuestionSortOrder] = useState<'asc' | 'desc'>('asc');
  const [questionView, setQuestionView] = useState<'all' | 'difficult'>('all');

  useEffect(() => {
    loadReports();
  }, [view]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.sessions.getReports(view === 'trash');
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToTrash = async (reportId: string) => {
    try {
      await api.sessions.moveToTrash(reportId);
      toast.success('Report moved to trash');
      loadReports();
      setSelectedReports(new Set());
    } catch (error) {
      console.error('Error moving to trash:', error);
      toast.error('Failed to move report to trash');
    }
  };

  const handleRestore = async (reportId: string) => {
    try {
      await api.sessions.restoreFromTrash(reportId);
      toast.success('Report restored');
      loadReports();
      setSelectedReports(new Set());
    } catch (error) {
      console.error('Error restoring report:', error);
      toast.error('Failed to restore report');
    }
  };

  const handlePermanentlyDelete = async (reportId: string) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this report? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await api.sessions.permanentlyDelete(reportId);
      toast.success('Report permanently deleted');
      loadReports();
      setSelectedReports(new Set());
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleSelectAll = () => {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredReports.map(r => r.id)));
    }
  };

  const handleSelectReport = (reportId: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      newSelected.add(reportId);
    }
    setSelectedReports(newSelected);
  };

  const filteredReports = reports.filter(report => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.quiz?.title.toLowerCase().includes(query) ||
      report.code.includes(query)
    );
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    const dateA = a.endedAt ? new Date(a.endedAt).getTime() : 0;
    const dateB = b.endedAt ? new Date(b.endedAt).getTime() : 0;

    switch (sortBy) {
      case 'date-desc':
        return dateB - dateA;
      case 'date-asc':
        return dateA - dateB;
      case 'title-asc':
        return (a.quiz?.title || '').localeCompare(b.quiz?.title || '');
      case 'title-desc':
        return (b.quiz?.title || '').localeCompare(a.quiz?.title || '');
      default:
        return 0;
    }
  });

  const loadParticipants = async (sessionId: string) => {
    setParticipantsLoading(true);
    try {
      const data = await api.responses.getSessionParticipants(sessionId);
      setParticipants(data);
    } catch (error) {
      console.error('Error loading participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const loadQuestions = async (sessionId: string) => {
    setQuestionsLoading(true);
    try {
      const data = await api.responses.getInsights(sessionId);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleViewParticipants = async (report: Report) => {
    setSelectedReport(report);
    setShowQuestions(false);
    await loadParticipants(report.id);
  };

  const handleViewQuestions = async (report: Report) => {
    setSelectedReport(report);
    setShowQuestions(true);
    await loadQuestions(report.id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleSortParticipants = (column: 'rank' | 'nickname' | 'score' | 'correct') => {
    if (participantSortBy === column) {
      setParticipantSortOrder(participantSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setParticipantSortBy(column);
      setParticipantSortOrder('asc');
    }
  };

  const filteredAndSortedParticipants = [...participants]
    .filter(p => {
      if (!participantSearchQuery) return true;
      const query = participantSearchQuery.toLowerCase();
      return p.username?.toLowerCase().includes(query) || p.nickname?.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (participantSortBy) {
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'nickname':
          comparison = (a.username || '').localeCompare(b.username || '');
          break;
        case 'score':
          comparison = b.finalScore - a.finalScore;
          break;
        case 'correct':
          comparison = b.correctCount - a.correctCount;
          break;
      }
      return participantSortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSortQuestions = (column: 'question' | 'type' | 'correct') => {
    if (questionSortBy === column) {
      setQuestionSortOrder(questionSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setQuestionSortBy(column);
      setQuestionSortOrder('asc');
    }
  };

  const filteredAndSortedQuestions = [...questions]
    .filter(q => {
      // Filter by difficulty if needed
      if (questionView === 'difficult') {
        // Consider questions with correctness rate < 50% as difficult
        if (q.correctnessRate >= 50) return false;
      }

      // Filter by search query
      if (!questionSearchQuery) return true;
      const query = questionSearchQuery.toLowerCase();
      return q.question?.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (questionSortBy) {
        case 'question':
          comparison = (a.question || '').localeCompare(b.question || '');
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'correct':
          comparison = a.correctnessRate - b.correctnessRate;
          break;
      }
      return questionSortOrder === 'asc' ? comparison : -comparison;
    });

  const formatQuestionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'MULTIPLE_CHOICE': 'Multiple choice',
      'TRUE_FALSE': 'True or false',
      'MULTIPLE_SELECT': 'Multiple select',
      'SHORT_ANSWER': 'Short answer',
      'LONG_ANSWER': 'Long answer',
    };
    return typeMap[type] || type;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  ← Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold pb-1">Reports</h1>
                <p className="text-sm text-muted-foreground">
                  View and manage your completed quiz sessions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border p-4 space-y-2">
                <button
                  onClick={() => setView('all')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    view === 'all'
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  All reports
                </button>
                <button
                  onClick={() => setView('trash')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    view === 'trash'
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  Trash
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Header Section */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">
                      {view === 'all' ? 'All reports' : 'Trash'}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-64"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center justify-center w-5 h-5 border rounded"
                        >
                          {selectedReports.size === filteredReports.length && filteredReports.length > 0 ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                        <span className="text-sm text-gray-600">Select all</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date-desc">Date (Latest first)</SelectItem>
                            <SelectItem value="date-asc">Date (Oldest first)</SelectItem>
                            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reports List */}
                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Spinner size="lg" />
                    </div>
                  ) : sortedReports.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {view === 'all' ? 'No reports yet' : 'Trash is empty'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sortedReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <button
                            onClick={() => handleSelectReport(report.id)}
                            className="flex items-center justify-center w-5 h-5 border rounded flex-shrink-0"
                          >
                            {selectedReports.has(report.id) ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1">
                              {report.quiz?.title || 'Untitled Quiz'}{' '}
                              <span className="text-xs text-gray-500">
                                ({report.id})
                              </span>
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Finished
                              </Badge>
                              <span>Ended {formatDate(report.endedAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-sm font-medium">ThinkTap</div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {report.participantCount}
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {view === 'all' ? (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleViewQuestions(report)}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      View Questions
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleViewParticipants(report)}
                                    >
                                      <Users className="h-4 w-4 mr-2" />
                                      View Participants
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/session/${report.id}/insights`}>
                                        View Insights
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleMoveToTrash(report.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Move to Trash
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleRestore(report.id)}
                                    >
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Restore
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handlePermanentlyDelete(report.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Permanently Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Participants Modal/Dialog */}
        {selectedReport && !showQuestions && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Participants</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedReport.quiz?.title || 'Untitled Quiz'}{' '}
                      <span className="text-xs text-gray-500">
                        ({selectedReport.id})
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedReport(null);
                      setParticipants([]);
                      setParticipantSearchQuery('');
                    }}
                  >
                    ✕
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">All ({participants.length})</span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search"
                      value={participantSearchQuery}
                      onChange={(e) => setParticipantSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Participants Table */}
              <div className="flex-1 overflow-auto p-6">
                {participantsLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : filteredAndSortedParticipants.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No participants found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th 
                            className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSortParticipants('nickname')}
                          >
                            <div className="flex items-center gap-2">
                              Nickname
                              <span className="text-gray-400">↕</span>
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSortParticipants('rank')}
                          >
                            <div className="flex items-center gap-2">
                              Rank
                              <span className="text-gray-400">↕</span>
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSortParticipants('correct')}
                          >
                            <div className="flex items-center gap-2">
                              Correct answers
                              <span className="text-gray-400">↕</span>
                            </div>
                          </th>
                          <th className="text-left p-3 font-semibold">Unanswered</th>
                          <th 
                            className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSortParticipants('score')}
                          >
                            <div className="flex items-center gap-2">
                              Final score
                              <span className="text-gray-400">↕</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedParticipants.map((participant) => (
                          <tr key={participant.identifier} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">
                              {participant.username}
                            </td>
                            <td className="p-3">
                              {participant.rank}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="relative w-16 h-16 flex-shrink-0">
                                  <svg className="w-16 h-16" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="45"
                                      stroke="#e5e7eb"
                                      strokeWidth="8"
                                      fill="none"
                                    />
                                    {/* Green portion for correct answers */}
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="45"
                                      stroke="#10b981"
                                      strokeWidth="8"
                                      fill="none"
                                      strokeDasharray={`${2 * Math.PI * 45}`}
                                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - participant.correctPercentage / 100)}`}
                                      strokeLinecap="round"
                                    />
                                    {/* Red portion for incorrect/unanswered */}
                                    {participant.correctPercentage < 100 && (
                                      <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke="#ef4444"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 45 * ((100 - participant.correctPercentage) / 100)} ${2 * Math.PI * 45}`}
                                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - participant.correctPercentage / 100)}`}
                                        strokeLinecap="round"
                                      />
                                    )}
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-sm font-semibold" style={{ transform: 'rotate(90deg)' }}>
                                      {participant.correctPercentage}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              {participant.unansweredCount > 0 ? participant.unansweredCount : '-'}
                            </td>
                            <td className="p-3 font-semibold">
                              {participant.finalScore}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Questions Modal/Dialog */}
        {selectedReport && showQuestions && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Questions</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedReport.quiz?.title || 'Untitled Quiz'}{' '}
                      <span className="text-xs text-gray-500">
                        ({selectedReport.id})
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedReport(null);
                      setShowQuestions(false);
                      setQuestions([]);
                      setQuestionSearchQuery('');
                    }}
                  >
                    ✕
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuestionView('all')}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        questionView === 'all'
                          ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      All ({questions.length})
                    </button>
                    <button
                      onClick={() => setQuestionView('difficult')}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        questionView === 'difficult'
                          ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Difficult questions ({questions.filter(q => q.correctnessRate < 50).length})
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search"
                      value={questionSearchQuery}
                      onChange={(e) => setQuestionSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Questions Table */}
              <div className="flex-1 overflow-auto p-6">
                {questionsLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : filteredAndSortedQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No questions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th 
                            className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSortQuestions('question')}
                          >
                            <div className="flex items-center gap-2">
                              Question
                              <span className="text-gray-400">↕</span>
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSortQuestions('type')}
                          >
                            <div className="flex items-center gap-2">
                              Type
                              <span className="text-gray-400">↕</span>
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSortQuestions('correct')}
                          >
                            <div className="flex items-center gap-2">
                              Correct/incorrect
                              <span className="text-gray-400">↕</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedQuestions.map((question, index) => {
                          const correctnessRate = Math.round(question.correctnessRate || 0);
                          return (
                            <tr key={question.questionId} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-500 font-medium">{question.order || index + 1}.</span>
                                  <span className="font-medium">{question.question}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                {formatQuestionType(question.type)}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 flex-shrink-0">
                                    <svg className="w-12 h-12" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                      <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="#e5e7eb"
                                        strokeWidth="6"
                                        fill="none"
                                      />
                                      {/* Green portion for correct answers */}
                                      <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="#10b981"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - correctnessRate / 100)}`}
                                        strokeLinecap="round"
                                      />
                                      {/* Red portion for incorrect - shown after green */}
                                      {correctnessRate < 100 && (
                                        <circle
                                          cx="50"
                                          cy="50"
                                          r="40"
                                          stroke="#ef4444"
                                          strokeWidth="6"
                                          fill="none"
                                          strokeDasharray={`${2 * Math.PI * 40 * ((100 - correctnessRate) / 100)} ${2 * Math.PI * 40}`}
                                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - correctnessRate / 100)}`}
                                          strokeLinecap="round"
                                        />
                                      )}
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <span className="text-xs font-semibold" style={{ transform: 'rotate(90deg)' }}>
                                        {correctnessRate}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

