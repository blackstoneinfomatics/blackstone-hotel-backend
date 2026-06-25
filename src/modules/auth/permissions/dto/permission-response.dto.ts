export class PermissionResponseDto {
  id!: string;

  code!: string;
  module!: string;
  action!: string;

  name!: string;
  description?: string | null;

  isSystem!: boolean;
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}