import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Post()
  async create(@Request() req, @Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(req.user.id, createQuizDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.quizzesService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.quizzesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    return this.quizzesService.update(id, req.user.id, updateQuizDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.quizzesService.delete(id, req.user.id);
  }
}

