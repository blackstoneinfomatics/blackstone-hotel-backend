import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Permission, Prisma } from '@prisma/client';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    where: Prisma.PermissionWhereInput,
    skip: number,
    take: number,
  ): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where,
      skip,
      take,
      orderBy: [
        {
          module: 'asc',
        },
        {
          action: 'asc',
        },
      ],
    });
  }

  async count(where: Prisma.PermissionWhereInput): Promise<number> {
    return this.prisma.permission.count({
      where,
    });
  }

  async findById(id: string) {
    return this.prisma.permission.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });
  }

  async updateStatus(
    id: string,
    isActive: boolean,
  ) {
    return this.prisma.permission.update({
      where: { id },
      data: { isActive },
    });
  }
}
