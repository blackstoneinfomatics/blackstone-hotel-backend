
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { PERMISSION_KEY } from '@/shared/decorators/permissions.decorator';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSION_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      ) ?? [];

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Authentication required.',
      );
    }

    const hasPermission =
      await Promise.all(
        requiredPermissions.map((permission) =>
          this.authorizationService.hasPermission(
            user.roleIds,
            permission,
          ),
        ),
      );

    if (hasPermission.some((allowed) => allowed)) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to perform this action.',
    );
  }
}