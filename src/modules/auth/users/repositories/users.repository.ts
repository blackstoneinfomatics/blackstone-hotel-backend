import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import {
  userInclude,
  UserWithRelations,
} from '../types/UserWithRelations.type';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmailAndPassword(
    email: string,
    tenantId?: string,
  ): Promise<UserWithRelations | null> {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
        ...(tenantId && { tenantId }),
      },
      include: userInclude,
    });
  }

  async findUserByEmailAndGoogle(
    email: string,
    tenantId?: string,
  ): Promise<UserWithRelations | null> {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
        ...(tenantId && { tenantId }),
      },
      include: userInclude,
    });
  }

  async findUserByEmail(
    email: string,
    tenantId?: string,
  ): Promise<UserWithRelations | null> {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
        ...(tenantId && { tenantId }),
      },
      include: userInclude,
    });
  }

  async findUserById(
    id: string,
    tenantId?: string,
  ): Promise<UserWithRelations | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId && { tenantId }),
      },
      include: userInclude,
    });
  }

  async updatePasswordDetailsByUserId(
    userId: string,
    mustChangePassword: boolean,
  ) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        mustChangePassword,
        passwordChangedAt: new Date(),
      },
    });
  }
}