
import { Injectable } from '@nestjs/common';

import { AuthorizationRepository } from '../repositories/authorization.repository';
import { PermissionCacheService } from './permission-cache.service';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly authorizationRepository: AuthorizationRepository,
    private readonly permissionCacheService: PermissionCacheService,
  ) {}

  async hasPermission(
    roleIds: string[],
    requiredPermission: string,
  ): Promise<boolean> {
    const permissions = new Set<string>();

    for (const roleId of roleIds) {
      let rolePermissions =
        await this.permissionCacheService.getRolePermissions(
          roleId,
        );

      if (!rolePermissions) {
        rolePermissions =
          await this.authorizationRepository.findPermissionCodesByRoleId(
            roleId,
          );

        await this.permissionCacheService.setRolePermissions(
          roleId,
          rolePermissions,
        );
      }

      rolePermissions.forEach((permission) =>
        permissions.add(permission),
      );
    }

    return permissions.has(requiredPermission);
  }
}