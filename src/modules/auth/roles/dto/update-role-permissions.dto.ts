import {
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  addedPermissionIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  removedPermissionIds?: string[];
}