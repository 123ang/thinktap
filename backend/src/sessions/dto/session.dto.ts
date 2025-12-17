import { IsEnum, IsString, IsOptional } from 'class-validator';
import { SessionMode } from '@prisma/client';

export class CreateSessionDto {
  @IsEnum(SessionMode)
  mode: SessionMode;

  @IsString()
  @IsOptional()
  title?: string;
}

export class JoinSessionDto {
  @IsString()
  code: string;
}

