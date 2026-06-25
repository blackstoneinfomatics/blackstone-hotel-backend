import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmailAndPassword(email: string, tenantId?: string) {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLocaleLowerCase(),
        deletedAt: null,
        ...(tenantId && { tenantId }),
      },
      include: {
        authProviders: {
          where: {
            provider: 'EMAIL_PASSWORD',
            deletedAt: null,
          },
          select: {
            id: true,
            provider: true,
            passwordHash: true,
            isPrimary: true,
            lastLoginAt: true,
          },
        },

        userRoles: {
          where: {
            isActive: true,
            revokedAt: null,
            deletedAt: null,
          },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: {
                      select: {
                        id: true,
                        code: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  async findUserByEmailAndGoogle(email: string, tenantId?: string) {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLocaleLowerCase(),
        deletedAt: null,
        ...(tenantId && { tenantId }),
      },
      include: {
        authProviders: {
          where: {
            provider: 'GOOGLE',
            deletedAt: null,
          },
          select: {
            id: true,
            provider: true,
            providerUserId:true,
            isPrimary: true,
            lastLoginAt: true,
          },
        },

        userRoles: {
          where: {
            isActive: true,
            revokedAt: null,
            deletedAt: null,
          },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: {
                      select: {
                        id: true,
                        code: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  async findUserByEmail(email: string, tenantId?: string) {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
        ...(tenantId && { tenantId }),
      },
      include: {
        authProviders: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            provider: true,
            providerUserId:true,
            isPrimary: true,
            lastLoginAt: true,
          },
        },

        userRoles: {
          where: {
            isActive: true,
            revokedAt: null,
            deletedAt: null,
          },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: {
                      select: {
                        id: true,
                        code: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
