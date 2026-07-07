import { ModuleScope } from "@prisma/client";

export class PermissionItemDto {
  id!: string;
  code!: string;
  action!: string;
  name!: string;
  description?: string;
  isSystem!: boolean;
  isActive!: boolean;
}

export class PermissionModuleGroupDto {
  module!: {
    id: string;
    name: string;
    code: string;
    moduleScope: ModuleScope;
  };

  permissions!: PermissionItemDto[];
}