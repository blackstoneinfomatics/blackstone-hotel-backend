import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateModuleDto } from './dto/CreateModule.dto';
import { UpdateModuleDto } from './dto/UpdateModule.dto';
import { ModuleRepository } from './repositories/module.repository';
import { ApiResponse } from '@/shared/interface/api-response.interface';
import { ModuleResponseDto } from './interfaces/ModuleResponse.interface';
import { GetModulesDto } from './dto/GetModules.dto';
import { Module, Prisma } from '@prisma/client';
import { ModuleWithParent } from './types/moduleWithParent.type';
import { PermissionRepository } from './repositories/permission.repository';
import { UpdateModuleStatusDto } from './dto/UpdateModuleStatusDto.dto';
import { GetModuleTreeDto } from './dto/GetModuleTreeDto.dto';
import { ModuleTreeResponseDto } from './dto/ModuleTreeResponseDto.dto';

@Injectable()
export class ModuleService {
  private readonly logger = new Logger(ModuleService.name);

  constructor(
    private readonly moduleRepository: ModuleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  private async validateModuleCode(code: string): Promise<void> {
    const existingCode = await this.moduleRepository.findByCode(code);

    if (existingCode) {
      throw new ConflictException('Module code already exists.');
    }
  }
  private async validateModuleName(name: string): Promise<void> {
    const existingName = await this.moduleRepository.findByName(name);

    if (existingName) {
      throw new ConflictException('Module name already exists.');
    }
  }
  private async validateParentModule(parentId?: string): Promise<void> {
    if (!parentId) return;

    const parent = await this.moduleRepository.findById(parentId);

    if (!parent) {
      throw new NotFoundException('Parent module not found.');
    }

    if (parent.deletedAt) {
      throw new BadRequestException('Parent module has been deleted.');
    }
  }
  private async findModuleById(id: string): Promise<ModuleWithParent | void> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new NotFoundException('Module not found.');
    }
  }
  async create(
    createModuleDto: CreateModuleDto,
  ): Promise<ApiResponse<ModuleResponseDto>> {
    try {
      await this.validateModuleCode(createModuleDto.code);
      await this.validateModuleName(createModuleDto.name);
      await this.validateParentModule(createModuleDto.parentId);

      const result = await this.moduleRepository.create(createModuleDto);
      return {
        success: true,
        message: 'Module created successfully.',
        data: result,
      };
    } catch (error) {
      this.logger.error(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Unable to create module. Please try again later.',
      );
    }
  }

  async findAll(
    query: GetModulesDto,
  ): Promise<ApiResponse<ModuleResponseDto[]>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        moduleScope,
        parentId,
      } = query;

      const skip = (page - 1) * limit;

      const where: Prisma.ModuleWhereInput = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            code: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (moduleScope) {
        where.moduleScope = moduleScope;
      }

      if (parentId) {
        where.parentId = parentId;
      }

      const [modules, total] = await Promise.all([
        this.moduleRepository.findMany(where, skip, limit),
        this.moduleRepository.count(where),
      ]);

      return {
        success: true,
        message: 'Modules retrieved successfully.',
        data: modules.map((module) => this.toResponse(module)),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve modules', error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to retrieve modules.');
    }
  }

  async findById(id: string): Promise<ApiResponse<ModuleResponseDto>> {
    try {
      const module = await this.moduleRepository.findById(id);
      if (!module) {
        throw new NotFoundException('Module not found.');
      }
      return {
        success: true,
        message: 'Module retrieved successfully.',
        data: this.toResponse(module),
      };
    } catch (error: any) {
      this.logger.error(`Failed to retrieve module ${id}`, error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to retrieve module.');
    }
  }

  async update(
    id: string,
    dto: UpdateModuleDto,
  ): Promise<ApiResponse<ModuleResponseDto>> {
    try {
      const module = await this.moduleRepository.findById(id);

      if (!module) {
        throw new NotFoundException('Module not found.');
      }

      // Check duplicate name
      if (dto.name && dto.name !== module.name) {
        const existing = await this.moduleRepository.findByName(dto.name);

        if (existing && existing.id !== id) {
          throw new ConflictException('Module name already exists.');
        }
      }

      // Parent validations
      if (dto.parentId) {
        if (dto.parentId === id) {
          throw new BadRequestException('A module cannot be its own parent.');
        }

        const parent = await this.moduleRepository.findById(dto.parentId);

        if (!parent) {
          throw new NotFoundException('Parent module not found.');
        }
      }

      const updatedModule = await this.moduleRepository.update(id, dto);

      return {
        success: true,
        message: 'Module updated successfully.',
        data: this.toResponse(updatedModule),
      };
    } catch (error: any) {
      this.logger.error(`Failed to update module ${id}`, error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to update module.');
    }
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      const module = await this.moduleRepository.findById(id);

      if (!module) {
        throw new NotFoundException('Module not found.');
      }

      if (module.isSystem) {
        throw new ForbiddenException('System modules cannot be deleted.');
      }

      const childCount = await this.moduleRepository.countChildren(id);

      if (childCount > 0) {
        throw new ConflictException(
          'Cannot delete module because it has child modules.',
        );
      }

      // Permission
      const permissionCount = await this.permissionRepository.countByModule(id);

      if (permissionCount > 0) {
        throw new ConflictException(
          'Cannot delete module because permissions are assigned.',
        );
      }

      // // TenantModule
      // const tenantModuleCount =
      //   await this.tenantModuleRepository.countByModule(id);

      // if (tenantModuleCount > 0) {
      //   throw new ConflictException(
      //     'Cannot delete module because it is assigned to tenants.',
      //   );
      // }

      // // PlanModule
      // const planModuleCount =
      //   await this.planModuleRepository.countByModule(id);

      // if (planModuleCount > 0) {
      //   throw new ConflictException(
      //     'Cannot delete module because it is assigned to plans.',
      //   );
      // }

      await this.moduleRepository.softDelete(id);

      return {
        success: true,
        message: 'Module deleted successfully.',
        data: null,
      };
    } catch (error: any) {
      this.logger.error(`Failed to delete module ${id}`, error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to delete module.');
    }
  }

  async updateStatus(
  id: string,
  dto: UpdateModuleStatusDto,
): Promise<ApiResponse<ModuleResponseDto>> {
  try {
    const module = await this.moduleRepository.findById(id);

    if (!module) {
      throw new NotFoundException('Module not found.');
    }

    if (module.isSystem) {
      throw new ForbiddenException(
        'System module status cannot be changed.',
      );
    }

    if (module.status === dto.status) {
      throw new BadRequestException(
        `Module is already ${dto.status.toLowerCase()}.`,
      );
    }

    const updatedModule = await this.moduleRepository.updateStatus(
      id,
      dto.status,
    );

    return {
      success: true,
      message: 'Module status updated successfully.',
      data: this.toResponse(updatedModule),
    };
  } catch (error: any) {
    this.logger.error(
      `Failed to update module status: ${id}`,
      error.stack,
    );

    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      'Unable to update module status.',
    );
  }
}
async getTree(
  query: GetModuleTreeDto,
): Promise<ApiResponse<ModuleTreeResponseDto[]>> {
  try {
    const modules = await this.moduleRepository.findTree(
      query.moduleScope,
    );

    const tree = this.buildTree(modules);

    return {
      success: true,
      message: 'Module tree retrieved successfully.',
      data: tree,
    };
  } catch (error : any) {
    this.logger.error('Failed to retrieve module tree', error.stack);

    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      'Unable to retrieve module tree.',
    );
  }
}
private buildTree(
  modules: Module[],
): ModuleTreeResponseDto[] {
  const moduleMap = new Map<
    string,
    ModuleTreeResponseDto
  >();

  modules.forEach((module) => {
    moduleMap.set(module.id, {
      id: module.id,
      name: module.name,
      code: module.code,
      description: module.description ?? "",
      route: module.route ?? "",
      icon: module.icon ?? "",
      displayOrder: module.displayOrder,
      moduleScope: module.moduleScope,
      children: [],
    });
  });

  const tree: ModuleTreeResponseDto[] = [];

  modules.forEach((module) => {
    const current = moduleMap.get(module.id)!;

    if (
      module.parentId &&
      moduleMap.has(module.parentId)
    ) {
      moduleMap
        .get(module.parentId)!
        .children.push(current);
    } else {
      tree.push(current);
    }
  });

  return tree;
}

  private toResponse(module: ModuleWithParent): ModuleResponseDto {
    return {
      id: module.id,
      name: module.name,
      code: module.code,
      description: module.description ? module.description : undefined,
      route: module.route ? module.route : undefined,
      icon: module.icon ? module.icon : undefined,
      displayOrder: module.displayOrder,
      moduleScope: module.moduleScope,
      isVisible: module.isVisible,
      isSystem: module.isSystem,
      status: module.status,

      parent: module.parent
        ? {
            id: module.parent.id,
            name: module.parent.name,
            code: module.parent.code,
          }
        : null,

      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    };
  }
}
