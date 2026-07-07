import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiResponse } from '@/shared/interface/api-response.interface';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { GetAllPermission } from './dto/getall-permission.dto';
import { Permission, Prisma, Status } from '@prisma/client';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { PermissionRepository } from './repositories/permission.respository';
import { PermissionWithModule } from './types/permission.types';
import { PermissionModuleGroupDto } from './dto/PermissionModuleGroupDto.dto';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);
  constructor(private readonly permissionRepository: PermissionRepository) {}
  create(createPermissionDto: CreatePermissionDto) {
    return 'This action adds a new permission';
  }

  async findAll(
    query: GetAllPermission,
  ): Promise<ApiResponse<PermissionModuleGroupDto[]>> {
    try {
      const { page = 1, limit = 10, search, moduleId, isActive } = query;

      const where: Prisma.PermissionWhereInput = {
        deletedAt: null,
        isActive: true,
        module: {
          deletedAt: null,
          status: Status.ACTIVE,
        },
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
          {
            module: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            module: {
              code: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ];
      }

      if (moduleId) {
        where.moduleId = moduleId;
      }

      if (typeof isActive === 'boolean') {
        where.isActive = isActive;
      }

      const [permissions, total] = await Promise.all([
        this.permissionRepository.findMany(where, skip, limit),
        this.permissionRepository.count(where),
      ]);
      const grouped = new Map<string, PermissionModuleGroupDto>();

    permissions.forEach((permission) => {
      const moduleId = permission.module.id;

      if (!grouped.has(moduleId)) {
        grouped.set(moduleId, {
          module: {
            id: permission.module.id,
            name: permission.module.name,
            code: permission.module.code,
            moduleScope: permission.module.moduleScope,
          },
          permissions: [],
        });
      }

      grouped.get(moduleId)!.permissions.push({
        id: permission.id,
        code: permission.code,
        action: permission.action,
        name: permission.name,
        description: permission.description  ?? "",
        isSystem: permission.isSystem,
        isActive: permission.isActive,
      });
    });

      return {
        success: true,
        message: 'Permissions retrieved successfully',
        data: Array.from(grouped.values()),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch permisssions`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Unable to fetch permissions');
    }
  }

  async findOne(id: string): Promise<ApiResponse<PermissionResponseDto>> {
    try {
      const permission = await this.permissionRepository.findById(id);
      if (!permission) {
        throw new NotFoundException('Permission not found');
      }
      return {
        success: true,
        message: 'Permission retrieved successfully',
        data: permission,
      };
    } catch (error: any) {
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

  async deactivate(id: string): Promise<ApiResponse<PermissionResponseDto>> {
    try {
      const permission = await this.permissionRepository.findById(id);
      if (!permission) {
        throw new NotFoundException('Permission not found');
      }
      await this.permissionRepository.updateStatus(id, false);
      return {
        success: true,
        message: 'Permission Deactivated Successfuly',
        data: null,
      };
    } catch (error: any) {
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

  private toResponse(permission: PermissionWithModule): PermissionResponseDto {
    return {
      id: permission.id,
      code: permission.code,
      module: {
        id: permission.module.id,
        name: permission.module.name,
        code: permission.module.code,
        moduleScope: permission.module.moduleScope,
      },
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
