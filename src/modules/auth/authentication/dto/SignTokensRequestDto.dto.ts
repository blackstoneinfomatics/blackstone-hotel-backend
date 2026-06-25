import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
} from 'class-validator';
import * as jwtclaimsInterface from '../../jwt/interfaces/jwtclaims.interface';

export class SignTokensRequestDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsString()
  audience?: string;

  @IsObject()
  claims!: jwtclaimsInterface.BaseClaims;

  @IsOptional()
  @IsNumber()
  accessTtlSec?: number;

  @IsOptional()
  @IsNumber()
  refreshTtlSec?: number;

  @IsOptional()
  @IsString()
  deviceId?: string;
}