import { IsOptional, IsString } from 'class-validator';

export class UpdateJtiSessionDto {
  @IsOptional()
  @IsString()
  accessTokenJti?: string;

  @IsOptional()
  @IsString()
  refreshTokenJti?: string;
}