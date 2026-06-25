import {
  IsOptional,
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

   @Transform(({ value }) => value?.trim().toLowerCase())
    @IsString()
    @MaxLength(50)
    @Matches(/^(android|ios|web|windows|macos|linux)$/i, {
      message:
        'Platform must be one of android, ios, web, windows, macos or linux.',
    })
    platform!: string;
}