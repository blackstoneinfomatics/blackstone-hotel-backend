export class PermissionItemDto {
  id!: string;
  name!: string;
  code!: string;
  selected!: boolean;
}

export class PermissionModuleDto {
  module!: string;
  permissions!: PermissionItemDto[];
}

export class RolePermissionResponseDto {
  roleId!: string;
  roleName!: string;
  modules!: PermissionModuleDto[];
}