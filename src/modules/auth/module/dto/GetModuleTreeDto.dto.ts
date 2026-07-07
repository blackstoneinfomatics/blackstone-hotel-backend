import { ModuleScope } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class GetModuleTreeDto {
  @IsOptional()
  @IsEnum(ModuleScope)
  moduleScope?: ModuleScope;
}