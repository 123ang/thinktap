import { IsEnum, IsString, IsOptional, IsUUID } from 'class-validator';
import { SessionMode } from '@prisma/client';

export class CreateSessionDto {
  @IsUUID()
  quizId: string; // Required: the quiz to host

  @IsEnum(SessionMode)
  @IsOptional()
  mode?: SessionMode;
}

export class JoinSessionDto {
  @IsString()
  code: string;
}
