// API Types for ThinkTap Frontend

export enum Plan {
  FREE = 'FREE',
  PRO = 'PRO',
  FACULTY = 'FACULTY',
  UNIVERSITY = 'UNIVERSITY',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
}

export enum SessionMode {
  RUSH = 'RUSH',
  THINKING = 'THINKING',
  SEMINAR = 'SEMINAR',
}

export enum SessionStatus {
  CREATED = 'CREATED',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  SHORT_ANSWER = 'SHORT_ANSWER',
  LONG_ANSWER = 'LONG_ANSWER',
}

export interface User {
  id: string;
  email: string;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  userId: string;
  user?: User;
  questions?: Question[];
  sessions?: Session[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    questions: number;
    sessions: number;
  };
  // Optional quiz-level settings (background music, countdown, podium, etc.)
  settings?: QuizSettings;
}

export interface QuizSettings {
  musicEnabled?: boolean;
  // File name or relative path for the background music track.
  // For now the default is "jumanji_drum.mp3" and the file should live under Next.js public.
  musicTrack?: string;
  countdownEnabled?: boolean;
  podiumEnabled?: boolean;
}

export interface Session {
  id: string;
  code: string;
  lecturerId: string;
  lecturer?: User;
  quizId?: string;
  quiz?: Quiz;
  mode: SessionMode;
  status: SessionStatus;
  createdAt: string;
  endedAt?: string;
  _count?: {
    responses: number;
  };
}

export interface Question {
  id: string;
  quizId: string;
  quiz?: Quiz;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: any;
  timerSeconds?: number;
  points?: number; // Points awarded for correct answer (20 = standard, 40 = double)
  order: number;
  createdAt: string;
  responses?: Response[];
}

export interface Response {
  id: string;
  sessionId: string;
  questionId: string;
  userId?: string;
  user?: User;
  response: any;
  isCorrect?: boolean;
  responseTimeMs: number;
  submittedAt: string;
}

// API Request/Response Types

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface CreateQuizDto {
  title: string;
  settings?: QuizSettings;
}

export interface UpdateQuizDto {
  title?: string;
  settings?: QuizSettings;
}

export interface CreateSessionDto {
  quizId: string;
  mode?: SessionMode;
}

export interface CreateQuestionDto {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: any;
  timerSeconds?: number;
  points?: number; // Points awarded for correct answer (20 = standard, 40 = double)
  order: number;
}

export interface SubmitResponseDto {
  questionId: string;
  userId?: string;
  nickname?: string;
  response: any;
  responseTimeMs: number;
}

// Analytics Types

export interface QuestionInsight {
  questionId: string;
  question: string;
  type: string;
  order: number;
  totalResponses: number;
  correctResponses: number;
  incorrectResponses: number;
  correctnessRate: number;
  avgResponseTimeMs: number;
  responseDistribution: Record<string, number>;
  fastestResponseMs?: number;
  slowestResponseMs?: number;
}

export interface RankingEntry {
  rank: number;
  userId?: string | null;
  nickname?: string | null;
  username: string;
  points: number;
  responseTimeMs: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  email?: string;
  totalCorrect: number;
  totalAnswered: number;
  avgResponseTimeMs: number;
  score: number;
}

export interface ParticipantEngagement {
  userId?: string;
  email?: string;
  totalResponses: number;
  correctResponses: number;
  avgResponseTimeMs: number;
  participationRate: number;
  engagementScore: number;
}

export interface SessionInsights {
  sessionId: string;
  code: string;
  mode: string;
  status: string;
  createdAt: Date;
  endedAt?: Date;
  totalQuestions: number;
  totalResponses: number;
  totalParticipants: number;
  avgResponsesPerQuestion: number;
  avgCorrectness: number;
  avgResponseTime: number;
  questions: QuestionInsight[];
  leaderboard?: LeaderboardEntry[];
  participantEngagement?: ParticipantEngagement[];
  anonymousStats?: {
    totalResponses: number;
    correctnessRate: number;
    responseDistribution: Record<string, Record<string, number>>;
  };
}

export interface DashboardStats {
  totalSessions: number;
  totalQuestions: number;
  totalResponses: number;
  totalParticipants: number;
  avgSessionDuration: number;
  avgParticipantsPerSession: number;
  avgQuestionsPerSession: number;
  avgResponsesPerQuestion: number;
  mostUsedMode: string;
  sessionsByMode: Record<string, number>;
  recentSessions: Array<{
    id: string;
    code: string;
    mode: string;
    status: string;
    createdAt: Date;
    participantCount: number;
    questionCount: number;
  }>;
}

// Socket.io Event Types

export interface SocketEvents {
  // Client to Server
  join_session: (code: string) => void;
  start_question: (questionId: string) => void;
  submit_response: (data: SubmitResponseDto) => void;
  show_results: (questionId: string) => void;
  end_session: () => void;

  // Server to Client
  student_joined: (data: { userId: string; email: string }) => void;
  question_started: (question: Question) => void;
  timer_update: (data: { timeRemaining: number }) => void;
  response_submitted: (data: { responseCount: number }) => void;
  results_shown: (data: QuestionInsight) => void;
  session_ended: () => void;
}

