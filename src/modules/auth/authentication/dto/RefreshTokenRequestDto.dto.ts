import { Transform } from 'class-transformer';
import { IsString, MaxLength, Matches } from 'class-validator';

export class RefreshTokenRequestDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString()
  @MaxLength(50)
  @Matches(/^(android|ios|web|windows|macos|linux)$/i, {
    message:
      'Platform must be one of android, ios, web, windows, macos or linux.',
  })
  platform!: string;
}
