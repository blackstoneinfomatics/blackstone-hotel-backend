import { ModuleScope } from '@prisma/client';

export class RolePermissionItemResponseDto {
  id!: string;

  code!: string;

  action!: string;

  name!: string;

  description?: string | null;

  isSystem!: boolean;

  isActive!: boolean;

  selected!: boolean;
}

export class RolePermissionModuleResponseDto {
  module!: {
    id: string;
    name: string;
    code: string;
    moduleScope: ModuleScope;
  };

  permissions!: RolePermissionItemResponseDto[];
}

export class RolePermissionResponseDto {
  roleId!: string;

  roleName!: string;

  modules!: RolePermissionModuleResponseDto[];
}