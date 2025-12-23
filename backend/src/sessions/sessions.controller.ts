import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '../auth/guards/jwt-optional-auth.guard';
import { SessionStatus } from '@prisma/client';

@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(req.user.id, createSessionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    return this.sessionsService.findAll(req.user.id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return this.sessionsService.findByCode(code);
  }

  // HTTP endpoint for joining a session (replaces Socket.IO join)
  // Public endpoint - allows optional authentication for lecturers
  // Must be defined before @Get(':id') to avoid route conflicts
  @Post(':id/join')
  @UseGuards(JwtOptionalAuthGuard)
  async joinSession(
    @Param('id') sessionId: string,
    // Use any here to fully bypass ValidationPipe for this body; service will validate logic
    @Body() joinDto: any,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    return this.sessionsService.joinSession(sessionId, {
      userId,
      nickname: joinDto.nickname,
      role: joinDto.role,
    });
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    // userId is optional here; service will enforce access rules when provided
    const userId = req?.user?.id;
    return this.sessionsService.findOne(id, userId);
  }

  // Public-ish endpoint: status changes are protected at the UI level,
  // and the service enforces lecturer-only changes when a userId is provided.
  @Patch(':id/status')
  @UseGuards(JwtOptionalAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: SessionStatus,
    @Request() req?: any,
  ) {
    // Safely extract userId - req and req.user may be undefined if not authenticated
    let userId: string | null = null;
    try {
      userId = req?.user?.id ?? null;
    } catch (error) {
      // If req is completely undefined, just use null
      userId = null;
    }
    return this.sessionsService.updateStatus(id, userId, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req) {
    return this.sessionsService.delete(id, req.user.id);
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard)
  async findAllReports(
    @Request() req,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.sessionsService.findAllReports(
      req.user.id,
      includeDeleted === 'true',
    );
  }

  @Post(':id/trash')
  @UseGuards(JwtAuthGuard)
  async moveToTrash(@Param('id') id: string, @Request() req) {
    return this.sessionsService.moveToTrash(id, req.user.id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard)
  async restoreFromTrash(@Param('id') id: string, @Request() req) {
    return this.sessionsService.restoreFromTrash(id, req.user.id);
  }

  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard)
  async permanentlyDelete(@Param('id') id: string, @Request() req) {
    return this.sessionsService.permanentlyDelete(id, req.user.id);
  }
}
