import { ModuleScope } from '@prisma/client';

export class ModuleTreeResponseDto {
  id!: string;

  name!: string;

  code!: string;

  description?: string;

  route?: string;

  icon?: string;

  displayOrder!: number;

  moduleScope!: ModuleScope;

  children!: ModuleTreeResponseDto[];
}