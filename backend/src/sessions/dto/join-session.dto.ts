import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum JoinRole {
  LECTURER = 'lecturer',
  STUDENT = 'student',
}

export class JoinSessionDto {
  @IsString()
  nickname?: string;

  @IsEnum(JoinRole)
  role: JoinRole;
}
