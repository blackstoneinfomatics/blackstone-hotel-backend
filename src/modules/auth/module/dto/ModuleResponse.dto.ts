import { ModuleScope, Status } from '@prisma/client';

export class ModuleResponseDto {
  id!: string;
  name!: string;
  code!: string;
  description?: string;

  route?: string;
  icon?: string;

  displayOrder!: number;

  parentId?: string;

  moduleScope!: ModuleScope;

  isVisible!: boolean;

  isSystem!: boolean;

  status!: Status;

  createdAt!: Date;
  updatedAt!: Date;
}
