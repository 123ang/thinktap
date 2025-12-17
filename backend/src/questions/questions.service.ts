import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/question.dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prismaService: PrismaService) {}

  async create(sessionId: string, userId: string, createQuestionDto: CreateQuestionDto) {
    // Verify session exists and user is the lecturer
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.lecturerId !== userId) {
      throw new ForbiddenException('Only the lecturer can add questions');
    }

    if (session.status === SessionStatus.ENDED) {
      throw new BadRequestException('Cannot add questions to an ended session');
    }

    const question = await this.prismaService.question.create({
      data: {
        sessionId,
        type: createQuestionDto.type,
        question: createQuestionDto.question,
        options: createQuestionDto.options ?? undefined,
        correctAnswer: createQuestionDto.correctAnswer,
        timerSeconds: createQuestionDto.timerSeconds,
        order: createQuestionDto.order,
      },
    });

    return question;
  }

  async createBulk(
    sessionId: string,
    userId: string,
    questions: CreateQuestionDto[],
  ) {
    // Verify session exists and user is the lecturer
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.lecturerId !== userId) {
      throw new ForbiddenException('Only the lecturer can add questions');
    }

    if (session.status === SessionStatus.ENDED) {
      throw new BadRequestException('Cannot add questions to an ended session');
    }

    const createdQuestions = await this.prismaService.$transaction(
      questions.map((q) =>
        this.prismaService.question.create({
          data: {
            sessionId,
            type: q.type,
            question: q.question,
            options: q.options ?? undefined,
            correctAnswer: q.correctAnswer,
            timerSeconds: q.timerSeconds,
            order: q.order,
          },
        }),
      ),
    );

    return createdQuestions;
  }

  async findAll(sessionId: string) {
    const questions = await this.prismaService.question.findMany({
      where: { sessionId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return questions;
  }

  async findOne(questionId: string) {
    const question = await this.prismaService.question.findUnique({
      where: { id: questionId },
      include: {
        session: {
          select: {
            id: true,
            mode: true,
            status: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async delete(questionId: string, userId: string) {
    const question = await this.prismaService.question.findUnique({
      where: { id: questionId },
      include: {
        session: {
          select: {
            lecturerId: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.session.lecturerId !== userId) {
      throw new ForbiddenException('Only the lecturer can delete questions');
    }

    await this.prismaService.question.delete({
      where: { id: questionId },
    });

    return { message: 'Question deleted successfully' };
  }
}

