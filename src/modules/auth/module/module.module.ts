import { Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { ModuleRepository } from './repositories/module.repository';
import { PermissionRepository } from './repositories/permission.repository';

@Module({
  controllers: [ModuleController],
  providers: [ModuleService,ModuleRepository,PermissionRepository],
})
export class ModuleModule {}
