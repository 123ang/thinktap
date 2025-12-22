'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import api from '@/lib/api';
import { SessionMode, QuestionType, CreateQuestionDto } from '@/types/api';
import { ArrowLeft, Clock, Star, Trash2, CheckCircle2, Circle } from 'lucide-react';

type QuestionKind = 'MC_SINGLE' | 'MC_MULTI' | 'TRUE_FALSE';
type PointsMode = 'STANDARD' | 'DOUBLE';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const TIME_OPTIONS = [
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' },
  { value: 15, label: '15 seconds' },
  { value: 20, label: '20 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 45, label: '45 seconds' },
  { value: 60, label: '1 minute' },
  { value: 90, label: '1 minute 30 seconds' },
  { value: 120, label: '2 minutes' },
  { value: 180, label: '3 minutes' },
  { value: 240, label: '4 minutes' },
];

type SidebarQuestion = {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  timerSeconds?: number | null;
  correctAnswer?: any;
  isDraft?: boolean;
};

function CreateSessionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarQuestions, setSidebarQuestions] = useState<SidebarQuestion[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [questionKind, setQuestionKind] = useState<QuestionKind>('MC_SINGLE');
  const [timeLimit, setTimeLimit] = useState<number>(20);
  const [pointsMode, setPointsMode] = useState<PointsMode>('STANDARD');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctIndexes, setCorrectIndexes] = useState<number[]>([0]);
  const [loading, setLoading] = useState(false);

  const updateCurrentSidebarQuestion = (partial: Partial<SidebarQuestion>) => {
    if (!selectedQuestionId) return;
    setSidebarQuestions((prev) =>
      prev.map((q) => (q.id === selectedQuestionId ? { ...q, ...partial } : q)),
    );
  };

  // Initial default question when creating a brand new ThinkTap
  // Do NOT run when editing an existing quiz (sessionId present in URL)
  useEffect(() => {
    const urlSessionId = searchParams.get('sessionId');
    if (urlSessionId || sessionId) return;
    if (sidebarQuestions.length > 0) return;

    const draftId = `draft-${Date.now()}`;
    setSelectedQuestionId(draftId);
    setQuestion('');
    setQuestionKind('MC_SINGLE');
    setOptions(['', '', '', '']);
    setCorrectIndexes([0]);
    setTimeLimit(20);
    setSidebarQuestions([
      {
        id: draftId,
        question: 'Untitled question',
        type: QuestionType.MULTIPLE_CHOICE,
        options: ['', '', '', ''],
        timerSeconds: 20,
        isDraft: true,
      },
    ]);
  }, [searchParams, sessionId, sidebarQuestions.length]);

  // If the route contains a quizId query param, set it and reset loaded flag
  // All data (title and questions) will be loaded from database in the loadExistingQuestions effect
  // Note: We check both 'quizId' and 'sessionId' for backward compatibility
  useEffect(() => {
    const paramId = searchParams.get('quizId') || searchParams.get('sessionId');
    console.log('[Edit Quiz] URL param check:', { paramId, currentSessionId: sessionId });
    if (paramId) {
      // If sessionId changed, reset the loaded flag to reload from database
      if (paramId !== sessionId) {
        console.log('[Edit Quiz] QuizId changed, resetting. Old:', sessionId, 'New:', paramId);
        setSessionId(paramId);
        setHasLoadedQuestions(false); // Reset flag so questions will load from database
        // Clear all state to prepare for fresh data from database
        setTitle('');
        setSidebarQuestions([]); // Clear sidebar to prevent stale data
        setSelectedQuestionId(null);
        setQuestion('');
        setOptions(['', '', '', '']);
        setCorrectIndexes([0]);
      } else {
        console.log('[Edit Quiz] QuizId unchanged');
      }
    } else {
      console.log('[Edit Quiz] No quizId in URL');
    }
  }, [searchParams, sessionId]);

  const computeCorrectAnswer = (
    kind: QuestionKind,
    opts: string[],
    indexes: number[],
  ) => {
    // Return indices instead of text for storage
    if (kind === 'MC_MULTI') {
      return indexes.filter((i) => i >= 0 && i < opts.length);
    }
    return indexes[0] ?? 0;
  };

  const handleOptionChange = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);

    const newCorrect = computeCorrectAnswer(questionKind, next, correctIndexes);
    updateCurrentSidebarQuestion({ options: next, correctAnswer: newCorrect });
  };

  const handleAddOption = () => {
    const next = [...options, ''];
    setOptions(next);
    updateCurrentSidebarQuestion({ options: next });
  };

  const handleToggleCorrect = (index: number) => {
    let nextIndexes: number[];
    if (questionKind === 'MC_SINGLE' || questionKind === 'TRUE_FALSE') {
      nextIndexes = [index];
    } else {
      nextIndexes = correctIndexes.includes(index)
        ? correctIndexes.filter((i) => i !== index)
        : [...correctIndexes, index];
    }

    setCorrectIndexes(nextIndexes);
    const newCorrect = computeCorrectAnswer(questionKind, options, nextIndexes);
    updateCurrentSidebarQuestion({ correctAnswer: newCorrect });
  };

  const visibleOptions = (() => {
    if (questionKind === 'TRUE_FALSE') {
      return ['True', 'False'];
    }
    return options;
  })();

  const handleCreate = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const filledOptions = visibleOptions.map((o) => o.trim()).filter((o) => o.length > 0);

    if (questionKind !== 'TRUE_FALSE' && filledOptions.length < 2) {
      toast.error('Please provide at least two answer options');
      return;
    }

    if (correctIndexes.length === 0) {
      toast.error('Please mark at least one correct answer');
      return;
    }

    setLoading(true);

    try {
      let activeQuizId = sessionId; // Note: sessionId is actually used as quizId in this context
      if (!activeQuizId) {
        // Create a Quiz first (not a Session)
        const quizTitle = title.trim() || 'Untitled Quiz';
        const quiz = await api.quizzes.create({ title: quizTitle });
        activeQuizId = quiz.id;
        setSessionId(quiz.id); // Using sessionId state to store quizId
        // Persist title for this quiz
        if (typeof window !== 'undefined') {
          localStorage.setItem(`thinktap-title-${quiz.id}`, quizTitle);
        }
        // Put quiz id into the URL so refresh can restore state
        router.replace(`/session/create?sessionId=${quiz.id}`);
      } else if (typeof window !== 'undefined' && title.trim()) {
        // Update quiz title if it changed
        localStorage.setItem(`thinktap-title-${activeQuizId}`, title.trim());
        // Optionally update the quiz title via API
        try {
          await api.quizzes.update(activeQuizId, { title: title.trim() });
        } catch (e) {
          console.error('Error updating quiz title:', e);
        }
      }

      let type: QuestionType;
      if (questionKind === 'TRUE_FALSE') {
        type = QuestionType.TRUE_FALSE;
      } else if (questionKind === 'MC_MULTI') {
        type = QuestionType.MULTIPLE_SELECT;
      } else {
        type = QuestionType.MULTIPLE_CHOICE;
      }

      const finalOptions =
        questionKind === 'TRUE_FALSE' ? ['True', 'False'] : filledOptions;

      // Store indices instead of text for correctAnswer
      let correctAnswer: any;
      if (type === QuestionType.MULTIPLE_SELECT) {
        correctAnswer = correctIndexes.filter((i) => i >= 0 && i < finalOptions.length);
        // Ensure we have at least one correct answer
        if (correctAnswer.length === 0) {
          toast.error('Please select at least one correct answer');
          setLoading(false);
          return;
        }
      } else {
        // For single select, ensure we have a valid index
        const selectedIndex = correctIndexes[0];
        if (selectedIndex === undefined || selectedIndex < 0 || selectedIndex >= finalOptions.length) {
          toast.error('Please select a correct answer');
          setLoading(false);
          return;
        }
        correctAnswer = selectedIndex;
      }
      
      // Final validation: ensure correctAnswer is never null or undefined
      if (correctAnswer === null || correctAnswer === undefined) {
        console.error('[Create Question] ERROR: correctAnswer is null/undefined after computation!', {
          correctAnswer,
          correctIndexes,
          type,
          finalOptions,
        });
        toast.error('Error: No correct answer selected. Please select a correct answer.');
        setLoading(false);
        return;
      }
      
      console.log('[Create Question] Computed correctAnswer:', {
        value: correctAnswer,
        type: typeof correctAnswer,
        isArray: Array.isArray(correctAnswer),
      });

      // Determine the order based on position in sidebar
      // If editing existing question, keep its position; if new draft, place at end
      let questionOrder = sidebarQuestions.length;
      if (selectedQuestionId && !selectedQuestionId.startsWith('draft-')) {
        // Editing existing question - find its current index
        const existingIndex = sidebarQuestions.findIndex((q) => q.id === selectedQuestionId);
        if (existingIndex !== -1) {
          questionOrder = existingIndex;
        }
      } else if (selectedQuestionId && selectedQuestionId.startsWith('draft-')) {
        // New draft - use its current position in sidebar
        const draftIndex = sidebarQuestions.findIndex((q) => q.id === selectedQuestionId);
        if (draftIndex !== -1) {
          questionOrder = draftIndex;
        }
      }

      const payload: CreateQuestionDto = {
        type,
        question,
        options: type === QuestionType.LONG_ANSWER ? undefined : finalOptions,
        correctAnswer,
        timerSeconds: timeLimit,
        order: questionOrder,
      };

      // If editing an existing saved question, delete and replace it to simulate update
      if (selectedQuestionId && !selectedQuestionId.startsWith('draft-')) {
        try {
          await api.questions.delete(activeQuizId, selectedQuestionId);
        } catch (e) {
          console.error('Error deleting existing question before update:', e);
        }
      }

      console.log('[Create Question] Sending payload:', payload);
      console.log('[Create Question] correctAnswer being sent:', {
        value: payload.correctAnswer,
        type: typeof payload.correctAnswer,
        isArray: Array.isArray(payload.correctAnswer),
      });
      const created = await api.questions.create(activeQuizId, payload);
      console.log('[Create Question] Created question from API:', created);
      console.log('[Create Question] correctAnswer returned:', {
        value: created.correctAnswer,
        type: typeof created.correctAnswer,
      });

      toast.success('Question saved');

      // Always replace the selected question (whether draft or existing) with the saved version
      setSidebarQuestions((prev) => {
        console.log('[Create Question] Updating sidebar. Current items:', prev.length, 'selectedQuestionId:', selectedQuestionId);
        const sidebarData: SidebarQuestion = {
          id: created.id,
          question: created.question,
          type: created.type,
          options: (created.options as string[]) || finalOptions,
          timerSeconds: created.timerSeconds,
          correctAnswer: created.correctAnswer,
        };
        console.log('[Create Question] New sidebar data:', sidebarData);

        if (selectedQuestionId) {
          const index = prev.findIndex((q) => q.id === selectedQuestionId);
          console.log('[Create Question] Found selectedQuestionId at index:', index);
          if (index !== -1) {
            // Replace the draft/existing question at this index
            const copy = [...prev];
            copy[index] = sidebarData;
            console.log('[Create Question] Replaced at index', index, 'new sidebar length:', copy.length);
            return copy;
          }
        }
        // If selectedQuestionId not found (shouldn't happen), append it
        console.log('[Create Question] Appending to sidebar. New length:', prev.length + 1);
        return [...prev, sidebarData];
      });

      setSelectedQuestionId(created.id);
      console.log('[Create Question] Set selectedQuestionId to:', created.id);
    } catch (error: any) {
      console.error('Error creating ThinkTap:', error);
      const message =
        error?.response?.data?.message || 'Failed to add question';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const confirmed = window.confirm('Remove this question from the quiz?');
    if (!confirmed) return;

    try {
      // If this is a local draft, just remove it from state
      if (questionId.startsWith('draft-')) {
        setSidebarQuestions((prev) => prev.filter((q) => q.id !== questionId));
        if (selectedQuestionId === questionId) {
          setSelectedQuestionId(sidebarQuestions[0]?.id ?? null);
        }
        return;
      }

      if (!sessionId) {
        // Should not happen for saved questions, but guard anyway
        setSidebarQuestions((prev) => prev.filter((q) => q.id !== questionId));
        return;
      }

      await api.questions.delete(sessionId, questionId);
      setSidebarQuestions((prev) => prev.filter((q) => q.id !== questionId));
      if (selectedQuestionId === questionId) {
        const next = sidebarQuestions.find((q) => q.id !== questionId);
        if (next) {
          setSelectedQuestionId(next.id);
          setQuestion(next.question);
          if (next.type === QuestionType.TRUE_FALSE) {
            setQuestionKind('TRUE_FALSE');
            setOptions(['True', 'False']);
          } else if (next.type === QuestionType.MULTIPLE_SELECT) {
            setQuestionKind('MC_MULTI');
            setOptions(next.options && next.options.length ? next.options : ['', '', '', '']);
          } else {
            setQuestionKind('MC_SINGLE');
            setOptions(next.options && next.options.length ? next.options : ['', '', '', '']);
          }
          setTimeLimit(next.timerSeconds ?? 20);
        } else {
          // No questions left, clear editor
          setQuestion('');
          setOptions(['', '', '', '']);
          setCorrectIndexes([0]);
        }
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to remove question');
    }
  };

  // When a quiz already exists, load its questions into the left sidebar
  // Only run when sessionId is first set from URL, not when it changes due to saving
  const [hasLoadedQuestions, setHasLoadedQuestions] = useState(false);
  useEffect(() => {
    const loadExistingQuestions = async () => {
      console.log('[Edit Quiz] loadExistingQuestions called:', { sessionId, hasLoadedQuestions });
      if (!sessionId || hasLoadedQuestions) {
        console.log('[Edit Quiz] Skipping load - sessionId:', sessionId, 'hasLoadedQuestions:', hasLoadedQuestions);
        return;
      }
      try {
        // Load quiz title from API
        console.log('[Edit Quiz] Loading quiz from database, quizId:', sessionId);
        try {
          const quiz = await api.quizzes.getById(sessionId);
          console.log('[Edit Quiz] Quiz loaded from database:', quiz);
          if (quiz.title) {
            console.log('[Edit Quiz] Setting title from database:', quiz.title);
            setTitle(quiz.title);
            // Also update localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(`thinktap-title-${sessionId}`, quiz.title);
            }
          } else {
            console.log('[Edit Quiz] Quiz has no title');
          }
        } catch (error) {
          console.error('[Edit Quiz] Error loading quiz title:', error);
          // Fallback to localStorage if API fails
          if (typeof window !== 'undefined') {
            const storedTitle = localStorage.getItem(`thinktap-title-${sessionId}`);
            console.log('[Edit Quiz] Fallback to localStorage, title:', storedTitle);
            if (storedTitle) {
              setTitle(storedTitle);
            }
          }
        }

        // Load questions
        console.log('[Edit Quiz] Loading questions from database, quizId:', sessionId);
        const existing = await api.questions.getAll(sessionId);
        console.log('[Edit Quiz] Questions loaded from database:', existing);
        // Sort by order field to maintain correct sequence
        const sorted = [...existing].sort((a, b) => (a.order || 0) - (b.order || 0));
        console.log('[Edit Quiz] Sorted questions:', sorted.length, 'items');
        const mapped: SidebarQuestion[] = sorted.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: (q.options as string[]) || [],
          timerSeconds: q.timerSeconds,
          correctAnswer: q.correctAnswer,
        }));
        console.log('[Edit Quiz] Mapped to sidebar format:', mapped);
        // Set the sidebar with loaded questions (state was already cleared in the URL effect)
        setSidebarQuestions(mapped);
        setHasLoadedQuestions(true);
        console.log('[Edit Quiz] setSidebarQuestions called with', mapped.length, 'questions');

        if (mapped.length > 0 && !selectedQuestionId) {
          const first = mapped[0];
          console.log('[Edit Quiz] Loading first question into editor:', first);
          setSelectedQuestionId(first.id);
          setQuestion(first.question);
          // hydrate editor from first question
          if (first.type === QuestionType.TRUE_FALSE) {
            setQuestionKind('TRUE_FALSE');
            setOptions(['True', 'False']);
          } else if (first.type === QuestionType.MULTIPLE_SELECT) {
            setQuestionKind('MC_MULTI');
            setOptions(first.options && first.options.length ? first.options : ['', '', '', '']);
          } else {
            setQuestionKind('MC_SINGLE');
            setOptions(first.options && first.options.length ? first.options : ['', '', '', '']);
          }
          setTimeLimit(first.timerSeconds ?? 20);
          const opts = first.options || [];
          const answer = first.correctAnswer;
          console.log('[Edit Quiz] First question correctAnswer:', answer, 'type:', typeof answer, 'isArray:', Array.isArray(answer));
          // Handle both old format (text) and new format (indices)
          if (Array.isArray(answer)) {
            // Check if it's already indices (numbers) or text (strings)
            if (answer.length > 0 && typeof answer[0] === 'number') {
              // Already indices
              const indices = answer.filter((i: number) => i >= 0 && i < opts.length);
              console.log('[Edit Quiz] Setting correctIndexes (array of numbers):', indices);
              setCorrectIndexes(indices);
            } else {
              // Old format: convert text to indices
              const indices = answer
                .map((a: any) => opts.indexOf(a))
                .filter((i: number) => i >= 0);
              console.log('[Edit Quiz] Converting text answers to indices:', indices);
              setCorrectIndexes(indices);
            }
          } else if (answer != null) {
            if (typeof answer === 'number') {
              // Already an index
              const idx = answer >= 0 && answer < opts.length ? answer : 0;
              console.log('[Edit Quiz] Setting correctIndexes (single number):', [idx]);
              setCorrectIndexes([idx]);
            } else {
              // Old format: convert text to index
              const idx = opts.indexOf(answer);
              const finalIdx = idx >= 0 ? idx : 0;
              console.log('[Edit Quiz] Converting text answer to index:', finalIdx);
              setCorrectIndexes([finalIdx]);
            }
          } else {
            console.log('[Edit Quiz] No correctAnswer found in database, defaulting to index 0 (Option A)');
            console.warn('[Edit Quiz] WARNING: Question has no correct answer! Please select one and save.');
            setCorrectIndexes([0]); // Default to first option
            // Show a warning toast to the user
            if (typeof window !== 'undefined') {
              setTimeout(() => {
                toast.warning('This question has no correct answer set. Please select the correct answer and save.');
              }, 500);
            }
          }
          console.log('[Edit Quiz] Editor hydrated with first question data');
        } else {
          console.log('[Edit Quiz] Not loading first question - mapped.length:', mapped.length, 'selectedQuestionId:', selectedQuestionId);
        }
      } catch (error) {
        console.error('[Edit Quiz] Error loading existing questions:', error);
        console.error('[Edit Quiz] Error details:', error instanceof Error ? error.message : error);
      }
    };

    void loadExistingQuestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, hasLoadedQuestions]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Enter ThinkTap title..."
                  value={title}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTitle(value);
                    if (typeof window !== 'undefined' && (sessionId || searchParams.get('sessionId'))) {
                      const id = sessionId ?? (searchParams.get('sessionId') as string);
                      localStorage.setItem(`thinktap-title-${id}`, value);
                    }
                  }}
                  className="h-9 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Short interactive lessons with quizzes.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-6 max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left column: question list */}
          <Card className="shadow-md lg:col-span-1 h-fit">
            <CardHeader className="space-y-2 pb-3">
              <CardTitle className="text-sm">Quiz</CardTitle>
              <CardDescription className="text-xs">
                Questions in this quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                {sidebarQuestions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No questions yet. Use the editor on the right, then press <span className="font-medium">Save</span>.
                  </p>
                )}
                {sidebarQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      // If clicking the already-selected question, don't reset the editor
                      if (selectedQuestionId === q.id) return;

                      setSelectedQuestionId(q.id);
                      setQuestion(q.question);

                      if (q.type === QuestionType.TRUE_FALSE) {
                        setQuestionKind('TRUE_FALSE');
                        setOptions(['True', 'False']);
                      } else if (q.type === QuestionType.MULTIPLE_SELECT) {
                        setQuestionKind('MC_MULTI');
                        setOptions(q.options && q.options.length ? q.options : ['', '', '', '']);
                      } else {
                        setQuestionKind('MC_SINGLE');
                        setOptions(q.options && q.options.length ? q.options : ['', '', '', '']);
                      }

                      setTimeLimit(q.timerSeconds ?? 20);
                      const opts = q.options || [];
                      const answer = q.correctAnswer;
                      if (Array.isArray(answer)) {
                        setCorrectIndexes(
                          answer
                            .map((a: any) => opts.indexOf(a))
                            .filter((i: number) => i >= 0),
                        );
                      } else if (answer != null) {
                        const idx = opts.indexOf(answer);
                        setCorrectIndexes([idx >= 0 ? idx : 0]);
                      } else {
                        setCorrectIndexes([0]);
                      }
                    }}
                    className={`group rounded-xl border bg-white/90 shadow-sm px-3 py-3 text-xs flex flex-col gap-2 transition hover:border-red-300 hover:shadow-md cursor-pointer ${
                      selectedQuestionId === q.id ? 'border-red-400 ring-1 ring-red-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                          {index + 1}. {q.question?.trim() || 'Untitled question'}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {q.type === QuestionType.TRUE_FALSE
                            ? 'True / False'
                            : 'Multiple choice'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 opacity-0 group-hover:opacity-100 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(q.id);
                        }}
                        aria-label="Delete question"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Question</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-medium text-amber-700">
                        20 pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => {
                    setQuestion('');
                    setOptions(['', '', '', '']);
                    setCorrectIndexes([0]);
                    setQuestionKind('MC_SINGLE');
                    const draftId = `draft-${Date.now()}`;
                    setSelectedQuestionId(draftId);
                    setSidebarQuestions((prev) => [
                      ...prev,
                      {
                        id: draftId,
                        question: 'Untitled question',
                        type: QuestionType.MULTIPLE_CHOICE,
                        isDraft: true,
                      },
                    ]);
                  }}
                >
                  + Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right column: question editor */}
          <Card className="shadow-lg lg:col-span-3">
            <CardHeader className="space-y-4">
              <div>
                <Label
                  htmlFor="question"
                  className="text-xs uppercase tracking-wide text-muted-foreground"
                >
                  Quiz question
                </Label>
                <Input
                  id="question"
                  placeholder="Start typing your question"
                  value={question}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQuestion(value);
                    updateCurrentSidebarQuestion({ question: value });
                  }}
                  className="mt-1 h-12 text-lg"
                />
              </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Center area: answers */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {visibleOptions.map((option, index) => {
                    const letter = LETTERS[index] || '?';
                    const isCorrect = correctIndexes.includes(index);

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleToggleCorrect(index)}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                          isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`h-8 w-8 flex items-center justify-center rounded-md text-sm font-bold text-white ${
                            ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'][index] ||
                            'bg-gray-500'
                          }`}
                        >
                          {letter}
                        </div>
                        <Input
                          placeholder={`Add answer ${index + 1}${index >= 2 ? ' (optional)' : ''}`}
                          value={questionKind === 'TRUE_FALSE' ? option : option}
                          onChange={(e) =>
                            questionKind === 'TRUE_FALSE'
                              ? undefined
                              : handleOptionChange(index, e.target.value)
                          }
                          disabled={questionKind === 'TRUE_FALSE'}
                          className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <div className="ml-2">
                          {isCorrect ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-white stroke-[2.5] drop-shadow-sm" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {questionKind !== 'TRUE_FALSE' && (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                    >
                      + Add more answers
                    </Button>
                  </div>
                )}
              </div>

              {/* Right: settings */}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Question type
                  </Label>
                  <Select
                    value={questionKind}
                    onValueChange={(v: QuestionKind) => {
                      setQuestionKind(v);
                      let nextIndexes: number[] = [];
                      if (v === 'TRUE_FALSE' || v === 'MC_SINGLE') {
                        nextIndexes = [0];
                      }
                      setCorrectIndexes(nextIndexes);

                      const mappedType =
                        v === 'TRUE_FALSE'
                          ? QuestionType.TRUE_FALSE
                          : v === 'MC_MULTI'
                          ? QuestionType.MULTIPLE_SELECT
                          : QuestionType.MULTIPLE_CHOICE;

                      const newCorrect = computeCorrectAnswer(v, options, nextIndexes);
                      updateCurrentSidebarQuestion({
                        type: mappedType,
                        correctAnswer: newCorrect,
                      });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MC_SINGLE">Multiple choice • Single select</SelectItem>
                      <SelectItem value="MC_MULTI">Multiple choice • Multiple select</SelectItem>
                      <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Time limit (seconds)
                  </Label>
                  <Select
                    value={String(timeLimit)}
                    onValueChange={(v) => {
                      const next = Number(v);
                      setTimeLimit(next);
                      updateCurrentSidebarQuestion({ timerSeconds: next });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Points
                  </Label>
                  <Select
                    value={pointsMode}
                    onValueChange={(v: PointsMode) => setPointsMode(v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="DOUBLE">Double points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {sessionId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => router.push(`/session/${sessionId}`)}
                  >
                    Go to quiz overview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function CreateSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CreateSessionPageContent />
    </Suspense>
  );
}

