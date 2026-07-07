
import { Injectable } from '@nestjs/common';

import { RedisService } from '@/infrastructure/redis/redis.service';
import { AuthorizationRedisKeys } from '@/shared/constants/authorization.constants';

@Injectable()
export class PermissionCacheService {
  constructor(
    private readonly redis: RedisService,
  ) {}

  async getRolePermissions(
  roleId: string,
): Promise<string[] | null> {

  const cache = await this.redis.get<string[]>(
    AuthorizationRedisKeys.rolePermissions(roleId),
  );

  return cache;
}

  async setRolePermissions(
    roleId: string,
    permissions: string[],
  ): Promise<void> {
    await this.redis.set(
      AuthorizationRedisKeys.rolePermissions(roleId),
      permissions
    );
  }

  async invalidateRolePermissions(
    roleId: string,
  ): Promise<void> {
    await this.redis.del(
      AuthorizationRedisKeys.rolePermissions(roleId),
    );
  }
}