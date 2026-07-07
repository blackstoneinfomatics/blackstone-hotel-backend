import { Global, Module } from '@nestjs/common';
import { AuthorizationService } from './services/authorization.service';
import { RedisModule } from '@/infrastructure/redis/redis.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionGuard } from './guards/permission.guard';
import { AuthorizationRepository } from './repositories/authorization.repository';
import { PermissionCacheService } from './services/permission-cache.service';

@Global()
@Module({
  imports:[
    RedisModule,
    RolesModule,
    PermissionsModule
  ],
  providers: [PermissionGuard,AuthorizationService,AuthorizationRepository,PermissionCacheService],
  exports: [PermissionGuard,AuthorizationService],
})
export class AuthorizationModule {}
