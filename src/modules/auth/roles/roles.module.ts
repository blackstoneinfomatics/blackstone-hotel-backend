import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleRepository } from './repositories/role.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';

@Module({
  controllers: [RolesController],
  providers: [RolesService,RoleRepository,RolePermissionRepository],
})
export class RolesModule {}
