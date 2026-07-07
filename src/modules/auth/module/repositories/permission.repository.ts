import { PrismaService } from "@/infrastructure/database/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PermissionRepository{
    constructor(private readonly prisma: PrismaService) {}
    

    async countByModule(moduleId:string){
        return this.prisma.permission.count({
            where:{
                moduleId:moduleId,
                deletedAt :null,
            }
        })
    }
}