import { RoleResponseDto } from './role-response.dto';

export class CreateRoleResponseDto {
  success!: boolean;

  message!: string;

  data!: RoleResponseDto;
}