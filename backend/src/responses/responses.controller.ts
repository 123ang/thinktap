import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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

