import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiResponse } from '@/shared/interface/api-response.interface';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { GetAllPermission } from './dto/getall-permission.dto';
import { Permission, Prisma } from '@prisma/client';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { PermissionRepository } from './repositories/permission.respository';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name)
  constructor( private readonly permissionRepository : PermissionRepository){}
  create(createPermissionDto: CreatePermissionDto) {
    return 'This action adds a new permission';
  }

  async findAll(query : GetAllPermission) :Promise<ApiResponse<PermissionResponseDto[]>> {
    try{
    const {
      page = 1,
      limit = 10,
      search,
      module,
      isActive,
    } = query;

    const where: Prisma.PermissionWhereInput = {
      deletedAt: null,
      isActive: true
    };
          const skip = (page - 1) * limit;

    if (search) {
      where.OR = [
        {
          code: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (module) {
      where.module = module;
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [permissions, total] =await Promise.all([
        this.permissionRepository.findMany(where, skip, limit),
        this.permissionRepository.count(where),
      ]);
    

      return  {
        success: true,
        message: 'Permissions retrieved successfully',
        data: permissions.map((permission) =>
        this.toResponse(permission),
      ),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }catch(error : any){
      this.logger.error(`Failed to fetch permisssions`, error.stack);

      throw new InternalServerErrorException('Unable to fetch permissions');
    }
  }

  async findOne(id: string):Promise<ApiResponse<PermissionResponseDto>> {
    try{
       const permission = await this.permissionRepository.findById(id);
       if(!permission){
        throw new NotFoundException('Permission not found');
       }
        return {
          success:true,
          message:"Permission retrieved successfully",
          data:permission
        }
    }catch(error:any) {
      this.logger.error(`Failed to fetch permisssion: ${id}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to fetch permission');
    }
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  async deactivate(id : string):Promise<ApiResponse<PermissionResponseDto>>{
    try{
        const permission = await this.permissionRepository.findById(id);
       if(!permission){
        throw new NotFoundException('Permission not found');
       }
        await this.permissionRepository.updateStatus(id,false);
        return {
          success: true,
          message :"Permission Deactivated Successfuly",
          data : null
        }
    }catch(error:any){
      this.logger.error(`Failed update permisssion: ${id}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to update permission');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }

   private toResponse(
    permission: Permission,
  ): PermissionResponseDto {
    return {
      id: permission.id,
      code: permission.code,
      module: permission.module,
      action: permission.action,
      name: permission.name,
      description: permission.description,
      isSystem: permission.isSystem,
      isActive: permission.isActive,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}

