import { IsEnum, IsString, IsNumber, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @IsOptional()
  options?: string[];

  @IsNotEmpty()
  correctAnswer: any; // Can be string, boolean, array, etc.

  @IsNumber()
  @IsOptional()
  timerSeconds?: number;

  @IsNumber()
  order: number;
}

export class BulkCreateQuestionsDto {
  @IsArray()
  questions: CreateQuestionDto[];
}

