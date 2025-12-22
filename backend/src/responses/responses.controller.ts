import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { SubmitResponseDto } from './dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sessions/:sessionId/responses')
export class ResponsesController {
  constructor(private responsesService: ResponsesService) {}

  @Post()
  async submit(
    @Param('sessionId') sessionId: string,
    @Body() submitResponseDto: SubmitResponseDto,
  ) {
    return this.responsesService.submit(sessionId, submitResponseDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllBySession(@Param('sessionId') sessionId: string) {
    return this.responsesService.findAllBySession(sessionId);
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  async getInsights(@Param('sessionId') sessionId: string) {
    return this.responsesService.getInsights(sessionId);
  }

  @Get('participant-stats')
  async getParticipantStats(
    @Param('sessionId') sessionId: string,
    @Query('userId') userId?: string,
    @Query('nickname') nickname?: string,
  ) {
    return this.responsesService.getParticipantStats(sessionId, { userId, nickname });
  }

  @Get('top-rankings')
  @UseGuards(JwtAuthGuard)
  async getTopRankings(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: string,
  ) {
    return this.responsesService.getTopRankings(sessionId, limit ? parseInt(limit) : 3);
  }
}

@Controller('questions/:questionId/responses')
export class QuestionResponsesController {
  constructor(private responsesService: ResponsesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllByQuestion(@Param('questionId') questionId: string) {
    return this.responsesService.findAllByQuestion(questionId);
  }
}

