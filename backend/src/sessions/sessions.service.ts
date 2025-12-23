import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/session.dto';
import { Plan, SessionStatus } from '@prisma/client';
import { SessionStateService } from '../session-state/session-state.service';

@Injectable()
export class SessionsService {
  constructor(
    private prismaService: PrismaService,
    private sessionStateService: SessionStateService,
  ) {}

  private generateSessionCode(): string {
    // Generate a random 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async create(userId: string, createSessionDto: CreateSessionDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify quiz exists and user owns it
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: createSessionDto.quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.userId !== userId) {
      throw new ForbiddenException('You can only host your own quizzes');
    }

    // Generate unique session code
    let code: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = this.generateSessionCode();
      const existing = await this.prismaService.session.findUnique({
        where: { code },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException('Failed to generate unique session code');
    }

    const session = await this.prismaService.session.create({
      data: {
        code: code!,
        lecturerId: userId,
        quizId: createSessionDto.quizId,
        mode: createSessionDto.mode || 'RUSH',
        status: SessionStatus.CREATED,
      },
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
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return session;
  }

  async findAll(userId: string) {
    const sessions = await this.prismaService.session.findMany({
      where: { lecturerId: userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
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

    return sessions;
  }

  async findAllReports(userId: string, includeDeleted: boolean = false) {
    const sessions = await this.prismaService.session.findMany({
      where: {
        lecturerId: userId,
        status: SessionStatus.ENDED,
        endedAt: { not: null }, // Only include sessions that have actually ended
        isDeleted: includeDeleted ? undefined : false,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        endedAt: 'desc',
      },
    });

    // Calculate unique participant count for each session
    const reportsWithParticipantCount = await Promise.all(
      sessions.map(async (session) => {
        // Get unique participants (by userId or nickname)
        const participants = await this.prismaService.response.findMany({
          where: { sessionId: session.id },
          select: {
            userId: true,
            nickname: true,
          },
          distinct: ['userId', 'nickname'],
        });

        // Count unique participants (filter out nulls and duplicates)
        const uniqueParticipants = new Set<string>();
        participants.forEach((p) => {
          const key = p.userId || p.nickname || '';
          if (key) uniqueParticipants.add(key);
        });

        return {
          ...session,
          participantCount: uniqueParticipants.size,
        };
      }),
    );

    return reportsWithParticipantCount;
  }

  async findOne(sessionId: string, userId?: string) {
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
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // If userId provided, check access
    if (
      userId &&
      session.lecturerId !== userId &&
      session.status !== SessionStatus.ACTIVE
    ) {
      throw new ForbiddenException('Access denied');
    }

    return session;
  }

  async findByCode(code: string) {
    const session = await this.prismaService.session.findUnique({
      where: { code },
      include: {
        lecturer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status === SessionStatus.ENDED) {
      throw new BadRequestException('Session has ended');
    }

    return session;
  }

  async updateStatus(
    sessionId: string,
    userId: string | null,
    status: SessionStatus,
  ) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // If userId is provided, enforce that only the lecturer can change status.
    // If userId is null (unauthenticated), allow for now (frontend route is already protected).
    if (userId && session.lecturerId !== userId) {
      throw new ForbiddenException(
        'Only the lecturer can update session status',
      );
    }

    const updated = await this.prismaService.session.update({
      where: { id: sessionId },
      data: {
        status,
        endedAt: status === SessionStatus.ENDED ? new Date() : undefined,
      },
    });

    // For FREE users, delete session data after it ends
    if (status === SessionStatus.ENDED && userId) {
      const lecturer = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });

      if (lecturer?.plan === Plan.FREE) {
        // Delete session data after a short delay (e.g., 1 hour) to allow lecturers to view final results
        // In production, you might use a scheduled job or queue for this
        // For now, we'll just mark it - actual deletion can be handled by a cron job
      }
    }

    return updated;
  }

  async delete(sessionId: string, userId: string) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.lecturerId !== userId) {
      throw new ForbiddenException('Only the lecturer can delete the session');
    }

    await this.prismaService.session.delete({
      where: { id: sessionId },
    });

    // Also delete session state from Redis
    await this.sessionStateService.deleteSessionState(sessionId);

    return { message: 'Session deleted successfully' };
  }

  async moveToTrash(sessionId: string, userId: string) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.lecturerId !== userId) {
      throw new ForbiddenException('Only the lecturer can delete the session');
    }

    const updated = await this.prismaService.session.update({
      where: { id: sessionId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: 'Report moved to trash', session: updated };
  }

  async restoreFromTrash(sessionId: string, userId: string) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.lecturerId !== userId) {
      throw new ForbiddenException('Only the lecturer can restore the session');
    }

    const updated = await this.prismaService.session.update({
      where: { id: sessionId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return { message: 'Report restored', session: updated };
  }

  async permanentlyDelete(sessionId: string, userId: string) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.lecturerId !== userId) {
      throw new ForbiddenException('Only the lecturer can delete the session');
    }

    if (!session.isDeleted) {
      throw new BadRequestException(
        'Session must be in trash before permanent deletion',
      );
    }

    await this.prismaService.session.delete({
      where: { id: sessionId },
    });

    // Also delete session state from Redis
    await this.sessionStateService.deleteSessionState(sessionId);

    return { message: 'Report permanently deleted' };
  }

  async joinSession(
    sessionId: string,
    joinData: {
      userId?: string;
      nickname?: string;
      role: 'lecturer' | 'student';
    },
  ) {
    // Verify session exists
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status === SessionStatus.ENDED) {
      throw new BadRequestException('Session has ended');
    }

    // Initialize session state in Redis if it doesn't exist
    const existingState =
      await this.sessionStateService.getSessionState(sessionId);
    if (!existingState) {
      await this.sessionStateService.createSessionState(sessionId, {
        status: session.status === SessionStatus.ACTIVE ? 'waiting' : 'waiting',
      });
    }

    // For students, check for duplicate nicknames
    if (joinData.role === 'student' && joinData.nickname) {
      const participants =
        await this.sessionStateService.getParticipants(sessionId);
      const existingNames: string[] = [];

      for (const socketId of participants) {
        const participant = await this.sessionStateService.getParticipant(
          sessionId,
          socketId,
        );
        if (participant?.nickname) {
          existingNames.push(participant.nickname);
        }
      }

      if (existingNames.includes(joinData.nickname)) {
        throw new BadRequestException(
          'This nickname is already taken in this session. Please choose another one.',
        );
      }
    }

    // Return session info (state will be managed in Redis)
    return {
      session: {
        id: session.id,
        code: session.code,
        status: session.status,
        mode: session.mode,
        quiz: session.quiz,
      },
      message: 'Successfully joined session',
    };
  }
}
