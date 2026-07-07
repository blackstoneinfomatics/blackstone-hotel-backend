import { ModuleScope } from "@prisma/client";

export class PermissionResponseDto {
  id!: string;

  code!: string;

  module!: {
    id: string;
    name: string;
    code: string;
    moduleScope: ModuleScope;
  };
  action!: string;

  name!: string;
  description?: string | null;

  isSystem!: boolean;
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}