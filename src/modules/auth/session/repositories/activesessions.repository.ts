import { PrismaService } from "@/infrastructure/database/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateActiveSessionDto } from "../dto/create-session.dto";
import { UpdateJtiSessionDto } from "../dto/updateJti-session.dto";

@Injectable()
export class ActiveSessionRepository{
   constructor(
    private readonly prisma : PrismaService
   ){}
   
    async create(data: CreateActiveSessionDto) {
    return this.prisma.activeSession.create({
      data: {
        id:data.id,
        tenantId: data.tenantId,
        userId: data.userId,
        deviceId: data.deviceId,
        platform:data.platform,
        accessTokenJti: data.accessTokenJti,
        refreshTokenJti: data.refreshTokenJti,
        refreshExpiresAt: data.refreshExpiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        country: data.country,
        appVersion: data.appVersion,
        isRevoked: data.isRevoked ?? false,
      },
    });
  }

  async findById(id: string, tenantId?: string) {
    return this.prisma.activeSession.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(tenantId && {tenantId})
      },
    });
  }

  async findSessionId(id:string){
    return this.prisma.activeSession.findUnique({
      where:{
        id
      }
    })
  }

  async revokeUpdate(id :string){
    return this.prisma.activeSession.update({
      where:{
          id
      },
      data:{
        lastAccessedAt:new Date(),
        isRevoked:true,
        logoutAt:new Date(),
        revokedAt:new Date()
      }

    })
  }

  async updateRefreshJti(
  id: string,
  data: UpdateJtiSessionDto,
) {
  return this.prisma.activeSession.update({
    where: {
      id,
    },
    data: {
      ...(data.accessTokenJti && {
        accessTokenJti: data.accessTokenJti,
      }),
      ...(data.refreshTokenJti && {
        refreshTokenJti: data.refreshTokenJti,
      }),
      updatedAt: new Date(),
      lastAccessedAt:new Date()
    },
  });
}

}