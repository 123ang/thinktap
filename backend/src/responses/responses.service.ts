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
      return userResponse === correctAnswer;
    }

    if (questionType === QuestionType.MULTIPLE_CHOICE) {
      return userResponse === correctAnswer;
    }

    if (questionType === QuestionType.MULTIPLE_SELECT) {
      if (!Array.isArray(userResponse) || !Array.isArray(correctAnswer)) {
        return false;
      }
      // Sort and compare arrays
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
}

