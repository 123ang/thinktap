import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
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
    @Body() joinDto: JoinSessionDto,
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
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    return this.sessionsService.findOne(id, req.user.id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body('status') status: SessionStatus,
  ) {
    return this.sessionsService.updateStatus(id, req.user.id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.sessionsService.delete(id, req.user.id);
  }
}

