export class RoleResponseDto {
  id!: string;

  name!: string;

  code!: string;

  description?: string | null;

  isSystem!: boolean;

  isActive!: boolean;

  isDeleted!: boolean;

  deletedAt?: Date | null;

  createdAt!: Date;

  updatedAt!: Date;
}