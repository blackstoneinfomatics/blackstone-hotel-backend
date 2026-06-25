import { PrismaService } from "@/infrastructure/database/prisma/prisma.service";
import { AuthProviderType } from "@/shared/enums/AuthProviderType.enum";
import { Injectable } from "@nestjs/common";


@Injectable()
export class AuthProviderRepository{
  constructor(private readonly prisma: PrismaService) {}

  async createGoogle(userId : string,provider:AuthProviderType,providerUserId:string ){
    return this.prisma.authProvider.create({
        data:{
            userId:userId,
            provider:provider,
            providerUserId:providerUserId
        }
    });
  }
}