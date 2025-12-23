import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class SubmitResponseDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsNotEmpty()
  response: any; // Can be string, boolean, array, etc.

  @IsNumber()
  responseTimeMs: number;

  @IsString()
  @IsOptional()
  userId?: string; // Optional for anonymous responses

  @IsString()
  @IsOptional()
  nickname?: string; // Student's nickname for anonymous play
}
