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

@Controller('quizzes/:quizId/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post()
  async create(
    @Param('quizId') quizId: string,
    @Request() req,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.questionsService.create(quizId, req.user.id, createQuestionDto);
  }

  @Post('bulk')
  async createBulk(
    @Param('quizId') quizId: string,
    @Request() req,
    @Body() bulkDto: BulkCreateQuestionsDto,
  ) {
    return this.questionsService.createBulk(
      quizId,
      req.user.id,
      bulkDto.questions,
    );
  }

  @Get()
  async findAll(@Param('quizId') quizId: string) {
    return this.questionsService.findAll(quizId);
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

