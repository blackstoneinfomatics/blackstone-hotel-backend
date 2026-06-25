import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GoogleOAuthLoginDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  googleId!: string;

  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email!: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  picture?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim().toLowerCase())
  platform!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  appVersion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(45) // IPv4 or IPv6
  @Transform(({ value }) => value?.trim())
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  userAgent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  country?: string;
}