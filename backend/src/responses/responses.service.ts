import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitResponseDto } from './dto/response.dto';
import { SessionStatus, SessionMode, QuestionType } from '@prisma/client';

@Injectable()
export class ResponsesService {
  constructor(private prismaService: PrismaService) {}

  private calculateCorrectness(
    questionType: QuestionType,
    userResponse: any,
    correctAnswer: any,
  ): boolean | null {
    // For long answers and short answers in certain modes, we may not auto-check
    if (
      questionType === QuestionType.LONG_ANSWER ||
      questionType === QuestionType.SHORT_ANSWER
    ) {
      // Simple string comparison (case-insensitive)
      if (typeof userResponse === 'string' && typeof correctAnswer === 'string') {
        return (
          userResponse.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
        );
      }
      // Check if correct answer is an array of acceptable answers
      if (Array.isArray(correctAnswer)) {
        const normalizedResponse = userResponse.trim().toLowerCase();
        return correctAnswer.some(
          (ans) => ans.trim().toLowerCase() === normalizedResponse,
        );
      }
      return null; // Manual review needed
    }

    if (questionType === QuestionType.TRUE_FALSE) {
      // For TRUE_FALSE, correctAnswer is stored as index (0 or 1)
      // userResponse is also an index from frontend
      if (typeof userResponse === 'number' && typeof correctAnswer === 'number') {
        return userResponse === correctAnswer;
      }
      // Fallback for old format (text comparison)
      return userResponse === correctAnswer;
    }

    if (questionType === QuestionType.MULTIPLE_CHOICE) {
      // For MULTIPLE_CHOICE, correctAnswer is stored as index
      // userResponse is also an index from frontend
      if (typeof userResponse === 'number' && typeof correctAnswer === 'number') {
        return userResponse === correctAnswer;
      }
      // Fallback for old format (text comparison)
      return userResponse === correctAnswer;
    }

    if (questionType === QuestionType.MULTIPLE_SELECT) {
      if (!Array.isArray(userResponse) || !Array.isArray(correctAnswer)) {
        return false;
      }
      // Both should be arrays of indices
      if (userResponse.length > 0 && typeof userResponse[0] === 'number' &&
          correctAnswer.length > 0 && typeof correctAnswer[0] === 'number') {
        // Compare indices directly
        const sorted1 = [...userResponse].sort((a, b) => a - b);
        const sorted2 = [...correctAnswer].sort((a, b) => a - b);
        return JSON.stringify(sorted1) === JSON.stringify(sorted2);
      }
      // Fallback for old format (text comparison)
      const sorted1 = [...userResponse].sort();
      const sorted2 = [...correctAnswer].sort();
      return JSON.stringify(sorted1) === JSON.stringify(sorted2);
    }

    return null;
  }

  async submit(sessionId: string, submitResponseDto: SubmitResponseDto) {
    // Verify session exists and is active
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    // Get question details and verify it belongs to the session's quiz
    const question = await this.prismaService.question.findUnique({
      where: { id: submitResponseDto.questionId },
      include: {
        quiz: {
          include: {
            sessions: {
              where: { id: sessionId },
            },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Verify question belongs to a quiz that's used in this session
    if (!question.quiz.sessions.some(s => s.id === sessionId)) {
      throw new BadRequestException('Question does not belong to this session');
    }

    // Calculate correctness
    const isCorrect = this.calculateCorrectness(
      question.type,
      submitResponseDto.response,
      question.correctAnswer,
    );

    // For Seminar mode, userId should be null (anonymous)
    const userId =
      session.mode === SessionMode.SEMINAR ? null : submitResponseDto.userId;

    // Create response
    const response = await this.prismaService.response.create({
      data: {
        sessionId,
        questionId: submitResponseDto.questionId,
        userId,
        nickname: submitResponseDto.nickname || null,
        response: submitResponseDto.response,
        isCorrect,
        responseTimeMs: submitResponseDto.responseTimeMs,
      },
    });

    return response;
  }

  async findAllBySession(sessionId: string) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const responses = await this.prismaService.response.findMany({
      where: { sessionId },
      include: {
        question: {
          select: {
            id: true,
            question: true,
            type: true,
            order: true,
          },
        },
        user: session.mode === SessionMode.SEMINAR
          ? false
          : {
              select: {
                id: true,
                email: true,
              },
            },
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });

    // For Seminar mode, ensure user information is not exposed
    if (session.mode === SessionMode.SEMINAR) {
      return responses.map((r) => ({
        ...r,
        userId: null,
        user: null,
      }));
    }

    return responses;
  }

  async findAllByQuestion(questionId: string) {
    const question = await this.prismaService.question.findUnique({
      where: { id: questionId },
      include: {
        responses: {
          take: 1,
          include: {
            session: {
              select: {
                mode: true,
              },
            },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Get session mode from first response, or default
    const sessionMode = question.responses[0]?.session?.mode || SessionMode.RUSH;

    const responses = await this.prismaService.response.findMany({
      where: { questionId },
      include: {
        user: sessionMode === SessionMode.SEMINAR
          ? false
          : {
              select: {
                id: true,
                email: true,
              },
            },
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });

    // For Seminar mode, ensure user information is not exposed
    if (sessionMode === SessionMode.SEMINAR) {
      return responses.map((r) => ({
        ...r,
        userId: null,
        user: null,
      }));
    }

    return responses;
  }

  async getInsights(sessionId: string) {
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

    const questions = session.quiz.questions;

    const insights = {
      sessionId,
      mode: session.mode,
      totalQuestions: questions.length,
      totalResponses: questions.reduce(
        (sum, q) => sum + q.responses.length,
        0,
      ),
      questions: questions.map((question) => {
        const responses = question.responses;
        const totalResponses = responses.length;
        const correctResponses = responses.filter((r) => r.isCorrect === true).length;
        const incorrectResponses = responses.filter(
          (r) => r.isCorrect === false,
        ).length;

        // Calculate average response time
        const avgResponseTime =
          totalResponses > 0
            ? responses.reduce((sum, r) => sum + r.responseTimeMs, 0) /
              totalResponses
            : 0;

        // Response distribution (for multiple choice)
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
        };
      }),
    };

    // For Rush mode, add leaderboard
    if (session.mode === SessionMode.RUSH) {
      const allResponses = await this.prismaService.response.findMany({
        where: {
          sessionId,
          isCorrect: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          responseTimeMs: 'asc',
        },
      });

      insights['leaderboard'] = allResponses.slice(0, 10).map((r, index) => ({
        rank: index + 1,
        userId: r.userId,
        email: r.user?.email,
        responseTimeMs: r.responseTimeMs,
      }));
    }

    return insights;
  }

  async getParticipantStats(sessionId: string, identifier: { userId?: string; nickname?: string }) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!session || !session.quiz) {
      throw new NotFoundException('Session not found');
    }

    // Find all responses for this participant
    const whereClause: any = { sessionId };
    if (identifier.userId) {
      whereClause.userId = identifier.userId;
    } else if (identifier.nickname) {
      whereClause.nickname = identifier.nickname;
    } else {
      throw new BadRequestException('Either userId or nickname must be provided');
    }

    const participantResponses = await this.prismaService.response.findMany({
      where: whereClause,
      include: {
        question: {
          select: {
            id: true,
            order: true,
          },
        },
      },
      orderBy: {
        question: {
          order: 'asc',
        },
      },
    });

    const totalQuestions = session.quiz.questions.length;
    const totalResponses = participantResponses.length;
    const correctCount = participantResponses.filter((r) => r.isCorrect === true).length;
    const wrongCount = participantResponses.filter((r) => r.isCorrect === false).length;
    const accuracy = totalResponses > 0 ? (correctCount / totalResponses) * 100 : 0;

    // Calculate ranking - get all participants and their scores
    const allResponses = await this.prismaService.response.findMany({
      where: { sessionId },
      select: {
        userId: true,
        nickname: true,
        isCorrect: true,
        points: true,
      },
    });

    // Group by participant (userId or nickname)
    const participantScores = new Map<string, { correct: number; points: number; identifier: string }>();
    
    allResponses.forEach((r) => {
      const key = r.userId || r.nickname || 'unknown';
      if (!participantScores.has(key)) {
        participantScores.set(key, { correct: 0, points: 0, identifier: key });
      }
      const score = participantScores.get(key)!;
      if (r.isCorrect) {
        score.correct++;
      }
      score.points += r.points || 0;
    });

    // Sort by correct count (descending), then by points (descending)
    const leaderboard = Array.from(participantScores.values())
      .sort((a, b) => {
        if (b.correct !== a.correct) {
          return b.correct - a.correct;
        }
        return b.points - a.points;
      });

    // Find participant's rank
    const participantKey = identifier.userId || identifier.nickname || '';
    const rank = leaderboard.findIndex((entry) => entry.identifier === participantKey) + 1;
    const totalParticipants = leaderboard.length;

    return {
      rank: rank > 0 ? rank : null,
      totalParticipants,
      totalQuestions,
      totalResponses,
      correctCount,
      wrongCount,
      accuracy: Math.round(accuracy * 100) / 100,
      points: participantResponses.reduce((sum, r) => sum + (r.points || 0), 0),
    };
  }

  async getTopRankings(sessionId: string, limit: number = 3) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!session || !session.quiz) {
      throw new NotFoundException('Session not found');
    }

    // Get all responses for this session
    const allResponses = await this.prismaService.response.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Group by participant (userId or nickname)
    const participantScores = new Map<string, {
      identifier: string;
      userId: string | null;
      nickname: string | null;
      email: string | null;
      correct: number;
      points: number;
      totalAnswered: number;
    }>();

    allResponses.forEach((r) => {
      const key = r.userId || r.nickname || 'unknown';
      if (!participantScores.has(key)) {
        participantScores.set(key, {
          identifier: key,
          userId: r.userId,
          nickname: r.nickname,
          email: r.user?.email || null,
          correct: 0,
          points: 0,
          totalAnswered: 0,
        });
      }
      const score = participantScores.get(key)!;
      score.totalAnswered++;
      if (r.isCorrect) {
        score.correct++;
      }
      score.points += r.points || 0;
    });

    // Sort by correct count (descending), then by points (descending)
    const leaderboard = Array.from(participantScores.values())
      .sort((a, b) => {
        if (b.correct !== a.correct) {
          return b.correct - a.correct;
        }
        return b.points - a.points;
      })
      .slice(0, limit)
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        nickname: entry.nickname,
        email: entry.email,
        username: entry.nickname || entry.email || `User ${entry.userId?.substring(0, 8) || 'Unknown'}`,
        correct: entry.correct,
        points: entry.points,
        totalAnswered: entry.totalAnswered,
      }));

    return leaderboard;
  }
}

