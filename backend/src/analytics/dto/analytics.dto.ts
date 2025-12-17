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

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  email?: string;
  totalCorrect: number;
  totalAnswered: number;
  avgResponseTimeMs: number;
  score: number; // Points based on correctness and speed
}

export interface ParticipantEngagement {
  userId?: string;
  email?: string;
  totalResponses: number;
  correctResponses: number;
  avgResponseTimeMs: number;
  participationRate: number; // Percentage of questions answered
  engagementScore: number; // Overall engagement metric
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
  leaderboard?: LeaderboardEntry[]; // For RUSH mode
  participantEngagement?: ParticipantEngagement[]; // For RUSH and THINKING modes
  anonymousStats?: {
    // For SEMINAR mode
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

