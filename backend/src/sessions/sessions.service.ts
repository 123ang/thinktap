import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/session.dto';
import { Plan, SessionStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prismaService: PrismaService) {}

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
        mode: createSessionDto.mode,
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
      },
    });

    return session;
  }

  async findAll(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // For FREE users, only return active sessions (no history)
    const whereClause =
      user.plan === Plan.FREE
        ? {
            lecturerId: userId,
            status: { not: SessionStatus.ENDED },
          }
        : {
            lecturerId: userId,
          };

    const sessions = await this.prismaService.session.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            questions: true,
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

  async findOne(sessionId: string, userId: string) {
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
        questions: {
          orderBy: { order: 'asc' },
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

    // Check if user is the lecturer or if session is active
    if (session.lecturerId !== userId && session.status !== SessionStatus.ACTIVE) {
      throw new ForbiddenException('Access denied');
    }

    // For FREE users, deny access to ended sessions (no history)
    if (
      session.lecturerId === userId &&
      session.lecturer.plan === Plan.FREE &&
      session.status === SessionStatus.ENDED
    ) {
      throw new ForbiddenException('Session history not available on free plan');
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

  async updateStatus(sessionId: string, userId: string, status: SessionStatus) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.lecturerId !== userId) {
      throw new ForbiddenException('Only the lecturer can update session status');
    }

    const updated = await this.prismaService.session.update({
      where: { id: sessionId },
      data: {
        status,
        endedAt: status === SessionStatus.ENDED ? new Date() : undefined,
      },
    });

    // For FREE users, delete session data after it ends
    if (status === SessionStatus.ENDED) {
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

    return { message: 'Session deleted successfully' };
  }
}

