import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsBoolean,
} from 'class-validator';

// Simple settings shape for a quiz.
// This is intentionally flat so it can evolve without breaking validation.
export class QuizSettingsDto {
  @IsOptional()
  @IsBoolean()
  musicEnabled?: boolean;

  // File name or relative path for the background music track.
  // For now we default to "jumanji_drum.mp3".
  @IsOptional()
  @IsString()
  @MaxLength(200)
  musicTrack?: string;

  @IsOptional()
  @IsBoolean()
  countdownEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  podiumEnabled?: boolean;
}

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  // Optional quiz-level settings (music, countdown, podium, etc.)
  @IsOptional()
  settings?: QuizSettingsDto;
}

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  // Optional partial update of settings.
  @IsOptional()
  settings?: QuizSettingsDto;
}
