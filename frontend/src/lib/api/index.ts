import apiClient from './client';
import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  Quiz,
  CreateQuizDto,
  UpdateQuizDto,
  Session,
  CreateSessionDto,
  Question,
  CreateQuestionDto,
  Response,
  SubmitResponseDto,
  SessionInsights,
  DashboardStats,
  QuestionInsight,
  LeaderboardEntry,
  ParticipantEngagement,
} from '@/types/api';

// Auth API
export const authApi = {
  register: (data: RegisterDto) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: LoginDto) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }),

  logout: () => {
    apiClient.clearAuth();
  },
};

// Quizzes API
export const quizzesApi = {
  create: (data: CreateQuizDto) =>
    apiClient.post<Quiz>('/quizzes', data),

  getAll: () =>
    apiClient.get<Quiz[]>('/quizzes'),

  getById: (quizId: string) =>
    apiClient.get<Quiz>(`/quizzes/${quizId}`),

  update: (quizId: string, data: UpdateQuizDto) =>
    apiClient.patch<Quiz>(`/quizzes/${quizId}`, data),

  delete: (quizId: string) =>
    apiClient.delete(`/quizzes/${quizId}`),
};

// Sessions API
export const sessionsApi = {
  create: (data: CreateSessionDto) =>
    apiClient.post<Session>('/sessions', data),

  getAll: () =>
    apiClient.get<Session[]>('/sessions'),

  getById: (sessionId: string) =>
    apiClient.get<Session>(`/sessions/${sessionId}`),

  getByCode: (code: string) =>
    apiClient.get<Session>(`/sessions/code/${code}`),

  updateStatus: (sessionId: string, status: string) =>
    apiClient.patch<Session>(`/sessions/${sessionId}/status`, { status }),

  delete: (sessionId: string) =>
    apiClient.delete(`/sessions/${sessionId}`),
};

// Questions API - Now uses quizId instead of sessionId
export const questionsApi = {
  create: (quizId: string, data: CreateQuestionDto) =>
    apiClient.post<Question>(`/quizzes/${quizId}/questions`, data),

  createBulk: (quizId: string, questions: CreateQuestionDto[]) =>
    apiClient.post<Question[]>(`/quizzes/${quizId}/questions/bulk`, {
      questions,
    }),

  getAll: (quizId: string) =>
    apiClient.get<Question[]>(`/quizzes/${quizId}/questions`),

  getById: (questionId: string) =>
    apiClient.get<Question>(`/questions/${questionId}`),

  delete: (quizId: string, questionId: string) =>
    apiClient.delete(`/quizzes/${quizId}/questions/${questionId}`),
};

// Responses API
export const responsesApi = {
  submit: (sessionId: string, data: SubmitResponseDto) =>
    apiClient.post<Response>(`/sessions/${sessionId}/responses`, data),

  getAllBySession: (sessionId: string) =>
    apiClient.get<Response[]>(`/sessions/${sessionId}/responses`),

  getAllByQuestion: (questionId: string) =>
    apiClient.get<Response[]>(`/questions/${questionId}/responses`),

  getInsights: (sessionId: string) =>
    apiClient.get<SessionInsights>(`/sessions/${sessionId}/responses/insights`),

  getParticipantStats: (sessionId: string, params: { userId?: string; nickname?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.nickname) queryParams.append('nickname', params.nickname);
    return apiClient.get<any>(`/sessions/${sessionId}/responses/participant-stats?${queryParams.toString()}`);
  },

  getTopRankings: (sessionId: string, limit: number = 3) =>
    apiClient.get<any[]>(`/sessions/${sessionId}/responses/top-rankings?limit=${limit}`),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () =>
    apiClient.get<DashboardStats>('/analytics/dashboard'),

  getSessionInsights: (sessionId: string) =>
    apiClient.get<SessionInsights>(`/analytics/sessions/${sessionId}`),

  getLeaderboard: (sessionId: string) =>
    apiClient.get<LeaderboardEntry[]>(`/analytics/sessions/${sessionId}/leaderboard`),

  getEngagement: (sessionId: string) =>
    apiClient.get<ParticipantEngagement[]>(`/analytics/sessions/${sessionId}/engagement`),

  getAnonymousStats: (sessionId: string) =>
    apiClient.get<any>(`/analytics/sessions/${sessionId}/anonymous`),

  getQuestionAnalytics: (questionId: string) =>
    apiClient.get<QuestionInsight>(`/analytics/questions/${questionId}`),
};

// Export all APIs
const api = {
  auth: authApi,
  quizzes: quizzesApi,
  sessions: sessionsApi,
  questions: questionsApi,
  responses: responsesApi,
  analytics: analyticsApi,
};

export default api;

