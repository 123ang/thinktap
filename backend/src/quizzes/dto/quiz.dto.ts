import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;
}

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;
}

