import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string) {
    return this.prisma.role.findFirst({
      where: {
        name: name,
        isDeleted: false,
      },
    });
  }

  async findByCode(code: string) {
    return this.prisma.role.findFirst({
      where: {
        code: code,
        isDeleted: false,
      },
    });
  }

  async create(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({
      data,
    });
  }

  async findMany(
    where: Prisma.RoleWhereInput,
    skip: number,
    take: number,
  ): Promise<Role[]> {
    return this.prisma.role.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async count(where: Prisma.RoleWhereInput): Promise<number> {
    return this.prisma.role.count({
      where,
    });
  }

  async findById(id: string) {
    return this.prisma.role.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
  }

  async update(id: string, data: Prisma.RoleUpdateInput) {
    return this.prisma.role.update({
      where: { id: id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.role.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
