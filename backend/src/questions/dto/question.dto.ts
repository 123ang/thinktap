import { IsEnum, IsString, IsNumber, IsOptional, IsArray, IsNotEmpty, ValidateIf } from 'class-validator';
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

  // Allow 0, null, undefined, arrays, strings, numbers - but validate it's not empty string/array
  @ValidateIf((o) => o.correctAnswer !== null && o.correctAnswer !== undefined)
  @IsNotEmpty({ message: 'correctAnswer cannot be empty' })
  correctAnswer: any; // Can be string, boolean, array, number (index), etc.

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

