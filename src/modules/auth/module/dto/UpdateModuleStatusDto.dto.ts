import { Status } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateModuleStatusDto {
  @IsEnum(Status)
  status!: Status;
}