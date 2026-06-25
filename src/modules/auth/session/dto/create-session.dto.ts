export class CreateSessionDto {}
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateActiveSessionDto {

  @IsString()
  @IsNotEmpty()
  id!: string;
  
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsUUID()
  userId!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deviceId!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  accessTokenJti!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  refreshTokenJti!: string;

  @IsDateString()
  refreshExpiresAt!: Date;

  @IsString()
  @IsOptional()
  platform?:string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(45) // Supports IPv4 & IPv6
  ipAddress!: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(1000)
  userAgent?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(20)
  appVersion?: string;

  @IsOptional()
  @IsBoolean()
  isRevoked?: boolean;
}