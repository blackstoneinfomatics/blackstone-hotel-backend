
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

@Injectable()
export class AuthorizationRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findPermissionCodesByRoleId(
    roleId: string,
  ): Promise<string[]> {
    const permissions =
      await this.prisma.rolePermission.findMany({
        where: {
          roleId,
        },
        select: {
          permission: {
            select: {
              code: true,
            },
          },
        },
      });

    return permissions.map(
      (permission) => permission.permission.code,
    );
  }
}