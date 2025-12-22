import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prismaService: PrismaService) {}

  async create(quizId: string, userId: string, createQuestionDto: CreateQuestionDto) {
    console.log('[QuestionsService] Creating question with DTO:', {
      quizId,
      type: createQuestionDto.type,
      question: createQuestionDto.question,
      options: createQuestionDto.options,
      correctAnswer: createQuestionDto.correctAnswer,
      correctAnswerType: typeof createQuestionDto.correctAnswer,
      timerSeconds: createQuestionDto.timerSeconds,
      order: createQuestionDto.order,
    });
    
    // Verify quiz exists and user owns it
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.userId !== userId) {
      throw new ForbiddenException('Only the quiz owner can add questions');
    }

    // Ensure correctAnswer is not null or undefined
    if (createQuestionDto.correctAnswer === null || createQuestionDto.correctAnswer === undefined) {
      throw new Error('correctAnswer is required and cannot be null');
    }

    const question = await this.prismaService.question.create({
      data: {
        quizId,
        type: createQuestionDto.type,
        question: createQuestionDto.question,
        options: createQuestionDto.options ?? undefined,
        correctAnswer: createQuestionDto.correctAnswer,
        timerSeconds: createQuestionDto.timerSeconds,
        order: createQuestionDto.order,
      },
    });

    console.log('[QuestionsService] Created question:', {
      id: question.id,
      correctAnswer: question.correctAnswer,
      correctAnswerType: typeof question.correctAnswer,
    });

    // Update quiz's updatedAt
    await this.prismaService.quiz.update({
      where: { id: quizId },
      data: { updatedAt: new Date() },
    });

    return question;
  }

  async createBulk(
    quizId: string,
    userId: string,
    questions: CreateQuestionDto[],
  ) {
    // Verify quiz exists and user owns it
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.userId !== userId) {
      throw new ForbiddenException('Only the quiz owner can add questions');
    }

    const createdQuestions = await this.prismaService.$transaction(
      questions.map((q) =>
        this.prismaService.question.create({
          data: {
            quizId,
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

    // Update quiz's updatedAt
    await this.prismaService.quiz.update({
      where: { id: quizId },
      data: { updatedAt: new Date() },
    });

    return createdQuestions;
  }

  async findAll(quizId: string) {
    const questions = await this.prismaService.question.findMany({
      where: { quizId },
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
    console.log('[QuestionsService] findOne called with questionId:', questionId);
    const question = await this.prismaService.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    console.log('[QuestionsService] Question from DB:', {
      id: question?.id,
      question: question?.question,
      correctAnswer: question?.correctAnswer,
      correctAnswerType: typeof question?.correctAnswer,
      correctAnswerJSON: JSON.stringify(question?.correctAnswer),
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
        quiz: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.quiz.userId !== userId) {
      throw new ForbiddenException('Only the quiz owner can delete questions');
    }

    await this.prismaService.question.delete({
      where: { id: questionId },
    });

    return { message: 'Question deleted successfully' };
  }
}

