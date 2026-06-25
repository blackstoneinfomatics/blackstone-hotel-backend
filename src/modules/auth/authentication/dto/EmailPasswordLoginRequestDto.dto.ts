
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class EMailPasswordLoginRequestDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'Invalid email address.' })
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 128, {
    message: 'Password must be between 8 and 128 characters.',
  })
  password!: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'Invalid app version format.',
  })
  appVersion?: string;

  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString()
  @MaxLength(50)
  @Matches(/^(android|ios|web|windows|macos|linux)$/i, {
    message:
      'Platform must be one of android, ios, web, windows, macos or linux.',
  })
  platform!: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(255)
  deviceId?: string;
}