import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { AuthProviderType } from '@/shared/enums/AuthProviderType.enum';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AuthProviderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createGoogle(
    userId: string,
    provider: AuthProviderType,
    providerUserId: string,
  ) {
    return this.prisma.authProvider.create({
      data: {
        userId: userId,
        provider: provider,
        providerUserId: providerUserId,
      },
    });
  }

  async updatePasswordHash(userId: string, passwordHash: string) {
    const provider = await this.prisma.authProvider.findFirst({
      where: {
        userId,
        provider: AuthProviderType.EMAIL_PASSWORD,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!provider) {
      throw new NotFoundException('Email authentication provider not found.');
    }

    return this.prisma.authProvider.update({
      where: {
        id: provider.id,
      },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });
  }
}
