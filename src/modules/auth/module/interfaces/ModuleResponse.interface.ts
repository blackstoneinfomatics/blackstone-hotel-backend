import { ModuleScope, Status } from "@prisma/client";

export class ModuleResponseDto {
  id!: string;
  name!: string;
  code!: string;

  description?: string | null;

  route?: string | null;

  icon?: string | null;

  displayOrder!: number;

  moduleScope!: ModuleScope;

  isVisible!: boolean;

  isSystem!: boolean;

  status!: Status;

  parent?: {
    id: string;
    name: string;
    code: string;
  } | null;

  createdAt!: Date;

  updatedAt!: Date;
}