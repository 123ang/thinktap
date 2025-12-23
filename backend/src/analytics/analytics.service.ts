import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan, SessionMode } from '@prisma/client';
import {
  SessionInsights,
  QuestionInsight,
  LeaderboardEntry,
  ParticipantEngagement,
  DashboardStats,
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Get comprehensive session insights
   */
  async getSessionInsights(
    sessionId: string,
    userId: string,
  ): Promise<SessionInsights> {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
      include: {
        lecturer: {
          select: {
            id: true,
            email: true,
            plan: true,
          },
        },
        quiz: {
          include: {
            questions: {
              include: {
                responses: {
                  where: {
                    sessionId: sessionId,
                  },
                  include: {
                    user: {
                      select: {
                        id: true,
                        email: true,
                      },
                    },
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check access permissions
    if (session.lecturerId !== userId) {
      throw new ForbiddenException(
        'Only the lecturer can view session insights',
      );
    }

    // Check if user has access to history
    if (session.lecturer.plan === Plan.FREE && session.status === 'ENDED') {
      throw new ForbiddenException(
        'Session history not available on free plan',
      );
    }

    if (!session.quiz) {
      throw new NotFoundException('Session has no quiz associated');
    }

    const questions = session.quiz.questions;

    // Calculate unique participants
    const uniqueParticipants = new Set(
      questions.flatMap((q) =>
        q.responses.map((r) => r.userId).filter(Boolean),
      ),
    );

    const totalResponses = questions.reduce(
      (sum, q) => sum + q.responses.length,
      0,
    );

    const avgResponsesPerQuestion =
      questions.length > 0 ? totalResponses / questions.length : 0;

    // Calculate question insights
    const questionInsights: QuestionInsight[] = questions.map((question) => {
      const responses = question.responses;
      const totalResponses = responses.length;
      const correctResponses = responses.filter(
        (r) => r.isCorrect === true,
      ).length;
      const incorrectResponses = responses.filter(
        (r) => r.isCorrect === false,
      ).length;

      // Calculate average response time
      const avgResponseTime =
        totalResponses > 0
          ? responses.reduce((sum, r) => sum + r.responseTimeMs, 0) /
            totalResponses
          : 0;

      // Calculate fastest and slowest responses
      const responseTimes = responses.map((r) => r.responseTimeMs);
      const fastestResponseMs =
        responseTimes.length > 0 ? Math.min(...responseTimes) : undefined;
      const slowestResponseMs =
        responseTimes.length > 0 ? Math.max(...responseTimes) : undefined;

      // Response distribution
      const responseDistribution: Record<string, number> = {};
      responses.forEach((r) => {
        const key = JSON.stringify(r.response);
        responseDistribution[key] = (responseDistribution[key] || 0) + 1;
      });

      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        order: question.order,
        totalResponses,
        correctResponses,
        incorrectResponses,
        correctnessRate:
          totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0,
        avgResponseTimeMs: Math.round(avgResponseTime),
        responseDistribution,
        fastestResponseMs,
        slowestResponseMs,
      };
    });

    // Calculate average correctness across all questions
    const totalCorrectness = questionInsights.reduce(
      (sum, q) => sum + q.correctnessRate,
      0,
    );
    const avgCorrectness =
      questionInsights.length > 0
        ? totalCorrectness / questionInsights.length
        : 0;

    // Calculate average response time across all questions
    const avgResponseTime =
      totalResponses > 0
        ? questions
            .flatMap((q) => q.responses)
            .reduce((sum, r) => sum + r.responseTimeMs, 0) / totalResponses
        : 0;

    const insights: SessionInsights = {
      sessionId: session.id,
      code: session.code,
      mode: session.mode,
      status: session.status,
      createdAt: session.createdAt,
      endedAt: session.endedAt || undefined,
      totalQuestions: questions.length,
      totalResponses,
      totalParticipants: uniqueParticipants.size,
      avgResponsesPerQuestion: Math.round(avgResponsesPerQuestion * 100) / 100,
      avgCorrectness: Math.round(avgCorrectness * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
      questions: questionInsights,
    };

    // Add mode-specific insights
    if (session.mode === SessionMode.RUSH) {
      insights.leaderboard = await this.calculateRushLeaderboard(sessionId);
      insights.participantEngagement =
        await this.calculateParticipantEngagement(sessionId, false);
    } else if (session.mode === SessionMode.THINKING) {
      insights.participantEngagement =
        await this.calculateParticipantEngagement(sessionId, false);
    } else if (session.mode === SessionMode.SEMINAR) {
      insights.anonymousStats = await this.calculateAnonymousStats(sessionId);
    }

    return insights;
  }

  /**
   * Calculate Rush Mode leaderboard
   */
  async calculateRushLeaderboard(
    sessionId: string,
  ): Promise<LeaderboardEntry[]> {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                responses: {
                  where: {
                    sessionId: sessionId,
                  },
                  include: {
                    user: {
                      select: {
                        id: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session || !session.quiz) {
      throw new NotFoundException('Session not found');
    }

    // Calculate scores for each participant
    const participantScores = new Map<
      string,
      {
        userId: string;
        email: string;
        totalCorrect: number;
        totalAnswered: number;
        totalResponseTime: number;
        score: number;
      }
    >();

    session.quiz.questions.forEach((question) => {
      question.responses.forEach((response) => {
        if (!response.userId) return; // Skip anonymous responses

        const key = response.userId;
        const existing = participantScores.get(key) || {
          userId: response.userId,
          email: response.user?.email || 'Unknown',
          totalCorrect: 0,
          totalAnswered: 0,
          totalResponseTime: 0,
          score: 0,
        };

        existing.totalAnswered += 1;
        existing.totalResponseTime += response.responseTimeMs;

        if (response.isCorrect) {
          existing.totalCorrect += 1;
          // Score calculation: 1000 points for correct, minus time penalty
          // Faster responses get higher scores
          const timeBonus = Math.max(0, 1000 - response.responseTimeMs / 10);
          existing.score += 1000 + timeBonus;
        }

        participantScores.set(key, existing);
      });
    });

    // Convert to array and sort by score
    const leaderboard = Array.from(participantScores.values())
      .map((p) => ({
        rank: 0, // Will be assigned after sorting
        userId: p.userId,
        email: p.email,
        totalCorrect: p.totalCorrect,
        totalAnswered: p.totalAnswered,
        avgResponseTimeMs: Math.round(p.totalResponseTime / p.totalAnswered),
        score: Math.round(p.score),
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return leaderboard;
  }

  /**
   * Calculate participant engagement metrics
   */
  async calculateParticipantEngagement(
    sessionId: string,
    anonymous: boolean,
  ): Promise<ParticipantEngagement[]> {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                responses: {
                  where: {
                    sessionId: sessionId,
                  },
                  include: {
                    user: anonymous
                      ? false
                      : {
                          select: {
                            id: true,
                            email: true,
                          },
                        },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session || !session.quiz) {
      throw new NotFoundException('Session not found');
    }

    const totalQuestions = session.quiz.questions.length;
    const participantStats = new Map<
      string,
      {
        userId?: string;
        email?: string;
        totalResponses: number;
        correctResponses: number;
        totalResponseTime: number;
      }
    >();

    session.quiz.questions.forEach((question) => {
      question.responses.forEach((response) => {
        const key = anonymous ? 'anonymous' : response.userId || 'anonymous';
        const existing = participantStats.get(key) || {
          userId: response.userId || undefined,
          email: response.user?.email || undefined,
          totalResponses: 0,
          correctResponses: 0,
          totalResponseTime: 0,
        };

        existing.totalResponses += 1;
        existing.totalResponseTime += response.responseTimeMs;

        if (response.isCorrect) {
          existing.correctResponses += 1;
        }

        participantStats.set(key, existing);
      });
    });

    return Array.from(participantStats.values())
      .map((p) => {
        const participationRate =
          totalQuestions > 0 ? (p.totalResponses / totalQuestions) * 100 : 0;
        const correctnessRate =
          p.totalResponses > 0
            ? (p.correctResponses / p.totalResponses) * 100
            : 0;
        const avgResponseTime =
          p.totalResponses > 0 ? p.totalResponseTime / p.totalResponses : 0;

        // Engagement score combines participation and correctness
        const engagementScore = participationRate * 0.6 + correctnessRate * 0.4;

        return {
          userId: p.userId,
          email: p.email,
          totalResponses: p.totalResponses,
          correctResponses: p.correctResponses,
          avgResponseTimeMs: Math.round(avgResponseTime),
          participationRate: Math.round(participationRate * 100) / 100,
          engagementScore: Math.round(engagementScore * 100) / 100,
        };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore);
  }

  /**
   * Calculate anonymous statistics for Seminar Mode
   */
  async calculateAnonymousStats(sessionId: string) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                responses: {
                  where: {
                    sessionId: sessionId,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session || !session.quiz) {
      throw new NotFoundException('Session not found');
    }

    const totalResponses = session.quiz.questions.reduce(
      (sum, q) => sum + q.responses.length,
      0,
    );

    const correctResponses = session.quiz.questions
      .flatMap((q) => q.responses)
      .filter((r) => r.isCorrect === true).length;

    const correctnessRate =
      totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0;

    // Response distribution per question
    const responseDistribution: Record<string, Record<string, number>> = {};

    session.quiz.questions.forEach((question) => {
      const questionKey = `Q${question.order}`;
      responseDistribution[questionKey] = {};

      question.responses.forEach((response) => {
        const answerKey = JSON.stringify(response.response);
        responseDistribution[questionKey][answerKey] =
          (responseDistribution[questionKey][answerKey] || 0) + 1;
      });
    });

    return {
      totalResponses,
      correctnessRate: Math.round(correctnessRate * 100) / 100,
      responseDistribution,
    };
  }

  /**
   * Get dashboard statistics for a lecturer
   */
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // For FREE users, only include active sessions
    const whereClause =
      user.plan === Plan.FREE
        ? { lecturerId: userId, status: { not: 'ENDED' as any } }
        : { lecturerId: userId };

    const sessions = await this.prismaService.session.findMany({
      where: whereClause,
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
        responses: true,
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce(
      (sum, s) => sum + (s.quiz?.questions.length || 0),
      0,
    );
    const totalResponses = sessions.reduce(
      (sum, s) => sum + s._count.responses,
      0,
    );

    // Calculate unique participants across all sessions
    const allParticipants = new Set(
      sessions.flatMap((s) => s.responses.map((r) => r.userId).filter(Boolean)),
    );
    const totalParticipants = allParticipants.size;

    // Calculate average session duration
    const completedSessions = sessions.filter((s) => s.endedAt);
    const avgSessionDuration =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => {
            const duration = s.endedAt!.getTime() - s.createdAt.getTime();
            return sum + duration;
          }, 0) /
          completedSessions.length /
          1000 /
          60 // Convert to minutes
        : 0;

    // Calculate averages
    const avgParticipantsPerSession =
      totalSessions > 0 ? totalParticipants / totalSessions : 0;
    const avgQuestionsPerSession =
      totalSessions > 0 ? totalQuestions / totalSessions : 0;
    const avgResponsesPerQuestion =
      totalQuestions > 0 ? totalResponses / totalQuestions : 0;

    // Calculate sessions by mode
    const sessionsByMode: Record<string, number> = {};
    let mostUsedMode = 'RUSH';
    let maxCount = 0;

    sessions.forEach((s) => {
      sessionsByMode[s.mode] = (sessionsByMode[s.mode] || 0) + 1;
      if (sessionsByMode[s.mode] > maxCount) {
        maxCount = sessionsByMode[s.mode];
        mostUsedMode = s.mode;
      }
    });

    // Get recent sessions
    const recentSessions = sessions.slice(0, 10).map((s) => {
      const uniqueParticipants = new Set(
        s.responses.map((r) => r.userId).filter(Boolean),
      );

      return {
        id: s.id,
        code: s.code,
        mode: s.mode,
        status: s.status,
        createdAt: s.createdAt,
        participantCount: uniqueParticipants.size,
        questionCount: s.quiz?.questions.length || 0,
      };
    });

    return {
      totalSessions,
      totalQuestions,
      totalResponses,
      totalParticipants,
      avgSessionDuration: Math.round(avgSessionDuration * 100) / 100,
      avgParticipantsPerSession:
        Math.round(avgParticipantsPerSession * 100) / 100,
      avgQuestionsPerSession: Math.round(avgQuestionsPerSession * 100) / 100,
      avgResponsesPerQuestion: Math.round(avgResponsesPerQuestion * 100) / 100,
      mostUsedMode,
      sessionsByMode,
      recentSessions,
    };
  }

  /**
   * Get question-level analytics
   */
  async getQuestionAnalytics(
    questionId: string,
    userId: string,
  ): Promise<QuestionInsight> {
    const question = await this.prismaService.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            user: {
              select: {
                id: true,
                plan: true,
              },
            },
            sessions: {
              where: {
                lecturerId: userId,
              },
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
        responses: true,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.quiz.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Check if user has access to history - find an ended session for this question
    const endedSession = question.quiz.sessions.find(
      (s) => s.status === 'ENDED',
    );
    if (question.quiz.user.plan === Plan.FREE && endedSession) {
      throw new ForbiddenException(
        'Question analytics not available on free plan',
      );
    }

    const responses = question.responses;
    const totalResponses = responses.length;
    const correctResponses = responses.filter(
      (r) => r.isCorrect === true,
    ).length;
    const incorrectResponses = responses.filter(
      (r) => r.isCorrect === false,
    ).length;

    const avgResponseTime =
      totalResponses > 0
        ? responses.reduce((sum, r) => sum + r.responseTimeMs, 0) /
          totalResponses
        : 0;

    const responseTimes = responses.map((r) => r.responseTimeMs);
    const fastestResponseMs =
      responseTimes.length > 0 ? Math.min(...responseTimes) : undefined;
    const slowestResponseMs =
      responseTimes.length > 0 ? Math.max(...responseTimes) : undefined;

    const responseDistribution: Record<string, number> = {};
    responses.forEach((r) => {
      const key = JSON.stringify(r.response);
      responseDistribution[key] = (responseDistribution[key] || 0) + 1;
    });

    return {
      questionId: question.id,
      question: question.question,
      type: question.type,
      order: question.order,
      totalResponses,
      correctResponses,
      incorrectResponses,
      correctnessRate:
        totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0,
      avgResponseTimeMs: Math.round(avgResponseTime),
      responseDistribution,
      fastestResponseMs,
      slowestResponseMs,
    };
  }
}
