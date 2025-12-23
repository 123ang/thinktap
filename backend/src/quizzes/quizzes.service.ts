import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private prismaService: PrismaService) {}

  async create(userId: string, createQuizDto: CreateQuizDto) {
    const defaultSettings = {
      musicEnabled: true,
      musicTrack: 'jumanji_drum.mp3',
      countdownEnabled: true,
      podiumEnabled: true,
    };

    const quiz = await this.prismaService.quiz.create({
      data: {
        title: createQuizDto.title,
        userId,
        // Cast to any to satisfy Prisma's JSON input type
        settings: {
          ...defaultSettings,
          ...(createQuizDto.settings || {}),
        } as any,
      },
      include: {
        _count: {
          select: {
            questions: true,
            sessions: true,
          },
        },
      },
    });

    return quiz;
  }

  async findAll(userId: string) {
    const quizzes = await this.prismaService.quiz.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            questions: true,
            sessions: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return quizzes;
  }

  async findOne(quizId: string, userId: string) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Last 10 sessions
          select: {
            id: true,
            code: true,
            status: true,
            createdAt: true,
            endedAt: true,
            _count: {
              select: {
                responses: true,
              },
            },
          },
        },
        _count: {
          select: {
            questions: true,
            sessions: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.userId !== userId) {
      throw new ForbiddenException('You do not have access to this quiz');
    }

    return quiz;
  }

  async update(quizId: string, userId: string, updateQuizDto: UpdateQuizDto) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.userId !== userId) {
      throw new ForbiddenException('You do not have access to this quiz');
    }

    // Normalize existing settings into a plain object so we can safely spread
    const existingSettings: Record<string, any> =
      quiz.settings && typeof quiz.settings === 'object'
        ? (quiz.settings as any)
        : {};

    const updated = await this.prismaService.quiz.update({
      where: { id: quizId },
      data: {
        title: updateQuizDto.title,
        // Merge existing settings with any provided updates, keeping defaults when absent.
        settings: updateQuizDto.settings
          ? ({
              ...existingSettings,
              ...updateQuizDto.settings,
            } as any)
          : (quiz.settings as any),
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            questions: true,
            sessions: true,
          },
        },
      },
    });

    return updated;
  }

  async delete(quizId: string, userId: string) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.userId !== userId) {
      throw new ForbiddenException('You do not have access to this quiz');
    }

    await this.prismaService.quiz.delete({
      where: { id: quizId },
    });

    return { deleted: true };
  }
}
