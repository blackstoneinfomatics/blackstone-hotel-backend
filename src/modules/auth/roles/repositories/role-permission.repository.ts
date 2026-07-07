import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { permissionInclude } from '../../permissions/types/permission.types';
import { Status } from '@prisma/client';

@Injectable()
export class RolePermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRoleById(id: string) {
    return this.prisma.role.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
    });
  }

  async findPermissions(permissionIds: string[]) {
    return this.prisma.permission.findMany({
      where: {
        id: {
          in: permissionIds,
        },
        deletedAt: null,
        isActive: true,
        module: {
          deletedAt: null,
          status: Status.ACTIVE,
        },
      },
    });
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    return this.prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
      skipDuplicates: true,
    });
  }

  async deleteRolePermissions(roleId: string) {
    return this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
      },
    });
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        module: {
          deletedAt: null,
          status: Status.ACTIVE,
        },
      },
      orderBy: [
        {
          module: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
      include: permissionInclude,
    });
  }

  async getRolePermission(roleId: string) {
    return this.prisma.rolePermission.findMany({
      where: {
        roleId,
      },
      select: {
        permissionId: true,
      },
    });
  }
}
