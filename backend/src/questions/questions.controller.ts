import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, BulkCreateQuestionsDto } from './dto/question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sessions/:sessionId/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post()
  async create(
    @Param('sessionId') sessionId: string,
    @Request() req,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.questionsService.create(sessionId, req.user.id, createQuestionDto);
  }

  @Post('bulk')
  async createBulk(
    @Param('sessionId') sessionId: string,
    @Request() req,
    @Body() bulkDto: BulkCreateQuestionsDto,
  ) {
    return this.questionsService.createBulk(
      sessionId,
      req.user.id,
      bulkDto.questions,
    );
  }

  @Get()
  async findAll(@Param('sessionId') sessionId: string) {
    return this.questionsService.findAll(sessionId);
  }

  @Get(':questionId')
  async findOne(@Param('questionId') questionId: string) {
    return this.questionsService.findOne(questionId);
  }

  @Delete(':questionId')
  async delete(@Param('questionId') questionId: string, @Request() req) {
    return this.questionsService.delete(questionId, req.user.id);
  }
}

