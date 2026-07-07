import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleRepository } from './repositories/role.repository';
import { ApiResponse } from '@/shared/interface/api-response.interface';
import { RoleResponseDto } from './dto/role-response.dto';
import { GetAllRolesDto } from './dto/getall-role.dto';
import { ModuleScope, Prisma } from '@prisma/client';
import { Status } from '@/shared/enums/status.enum';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { RolePermissionResponseDto } from './dto/role-permission-response.dto';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    createRoleDto: CreateRoleDto,
  ): Promise<ApiResponse<RoleResponseDto>> {
    try {
      const roleName = createRoleDto.name.trim();

      const roleCode = createRoleDto.code.trim().toUpperCase();

      const existingName = await this.roleRepository.findByName(roleName);

      if (existingName) {
        throw new BadRequestException('Role name already exists');
      }

      const existingCode = await this.roleRepository.findByCode(roleCode);

      if (existingCode) {
        throw new BadRequestException('Role code already exists');
      }

      const role = await this.roleRepository.create({
        name: roleName,
        code: roleCode,
        description: createRoleDto.description?.trim(),
      });

      return {
        success: true,
        message: 'Role created successfully',
        data: role,
      } as ApiResponse<RoleResponseDto>;
    } catch (error: any) {
      this.logger.error(`Create Role Failed : ${error.message}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to create role');
    }
  }

  async createRolePermission(
    roleId: string,
    assignPermission: AssignPermissionsDto,
  ) {
    try {
      const role = await this.rolePermissionRepository.findRoleById(roleId);
      if (!roleId) {
        throw new NotFoundException('Role not found');
      }

      const permissions = await this.rolePermissionRepository.findPermissions(
        assignPermission.permissionIds,
      );
      if (permissions.length !== assignPermission.permissionIds.length) {
        throw new BadRequestException('Invalid permission ids');
      }

      await this.rolePermissionRepository.assignPermissions(
        roleId,
        assignPermission.permissionIds,
      );

      return {
        success: true,
        message: 'Role Permissions created successfully',
      };
    } catch (error: any) {
      this.logger.error(
        `Create Role Permission Failed : ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Unable to create  Role Permission ',
      );
    }
  }

  async findAll(
    query: GetAllRolesDto,
  ): Promise<ApiResponse<RoleResponseDto[]>> {
    try {
      const { page, limit, search, status } = query;

      const skip = (page - 1) * limit;

      const where: Prisma.RoleWhereInput = {
        isDeleted: false,
      };

      if (search?.trim()) {
        where.OR = [
          {
            name: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
          {
            code: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
        ];
      }

      if (status) {
        where.isActive = status === Status.ACTIVE;
      }

      const [roles, total] = await Promise.all([
        this.roleRepository.findMany(where, skip, limit),
        this.roleRepository.count(where),
      ]);

      return {
        success: true,
        message: 'Roles retrieved successfully',
        data: roles,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch roles`, error.stack);

      throw new InternalServerErrorException('Unable to fetch roles');
    }
  }

  async getRolePermissions(
  roleId: string,
): Promise<ApiResponse<RolePermissionResponseDto>> {
  try {
    const role = await this.rolePermissionRepository.findRoleById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const allPermissions =
      await this.rolePermissionRepository.getAllPermissions();

    const rolePermissions =
      await this.rolePermissionRepository.getRolePermission(roleId);

    const assignedPermissionIds = new Set(
      rolePermissions.map((item) => item.permissionId),
    );

    const moduleMap = new Map<
      string,
      {
        module: {
          id: string;
          name: string;
          code: string;
          moduleScope: ModuleScope;
        };
        permissions: {
          id: string;
          code: string;
          action: string;
          name: string;
          description: string | null;
          isSystem: boolean;
          isActive: boolean;
          selected: boolean;
        }[];
      }
    >();

    for (const permission of allPermissions) {
      const moduleId = permission.module.id;

      if (!moduleMap.has(moduleId)) {
        moduleMap.set(moduleId, {
          module: {
            id: permission.module.id,
            name: permission.module.name,
            code: permission.module.code,
            moduleScope: permission.module.moduleScope,
          },
          permissions: [],
        });
      }

      moduleMap.get(moduleId)!.permissions.push({
        id: permission.id,
        code: permission.code,
        action: permission.action,
        name: permission.name,
        description: permission.description,
        isSystem: permission.isSystem,
        isActive: permission.isActive,
        selected: assignedPermissionIds.has(permission.id),
      });
    }

    return {
      success: true,
      message: 'Role permissions retrieved successfully.',
      data: {
        roleId: role.id,
        roleName: role.name,
        modules: Array.from(moduleMap.values()),
      },
    };
  } catch (error: any) {
    this.logger.error(
      `Failed to fetch role permissions`,
      error.stack,
    );

    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      'Unable to fetch role permissions',
    );
  }
}

  async findOne(id: string): Promise<ApiResponse<RoleResponseDto>> {
    try {
      const role = await this.roleRepository.findById(id);

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      return {
        success: true,
        message: 'Role retrieved successfully',
        data: role,
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch role: ${id}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to fetch role');
    }
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<ApiResponse<RoleResponseDto>> {
    try {
      const role = await this.roleRepository.findById(id);

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      if (role.isSystem) {
        throw new BadRequestException('System roles cannot be modified');
      }

      const updatedRole = await this.roleRepository.update(id, {
        ...(updateRoleDto.name && {
          name: updateRoleDto.name.trim(),
        }),

        ...(updateRoleDto.description !== undefined && {
          description: updateRoleDto.description?.trim(),
        }),

        ...(updateRoleDto.isActive !== undefined && {
          isActive: updateRoleDto.isActive,
        }),
      });

      return {
        success: true,
        message: 'Role updated successfully',
        data: updatedRole,
      };
    } catch (error: any) {
      this.logger.error(`Failed to update role: ${id}`, error.stack);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to update role');
    }
  }

  async remove(id: string): Promise<ApiResponse<RoleResponseDto>> {
    try {
      const role = await this.roleRepository.findById(id);

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      if (role.isSystem) {
        throw new BadRequestException('System roles cannot be deleted');
      }

      await this.roleRepository.softDelete(id);

      return {
        success: true,
        message: 'Role deleted successfully',
        data: null,
      };
    } catch (error: any) {
      this.logger.error(`Failed to delete role: ${id}`, error.stack);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to delete role');
    }
  }

  async updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto) {
    try {
      const role = await this.rolePermissionRepository.findRoleById(roleId);

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      const addedIds = dto.addedPermissionIds ?? [];

      const removedIds = dto.removedPermissionIds ?? [];

      const allPermissionIds = [...addedIds, ...removedIds];

      if (allPermissionIds.length > 0) {
        const permissions =
          await this.rolePermissionRepository.findPermissions(allPermissionIds);

        if (permissions.length !== allPermissionIds.length) {
          throw new BadRequestException('One or more permissions are invalid');
        }
      }

      await this.prisma.$transaction(async (tx) => {
        if (addedIds.length > 0) {
          await tx.rolePermission.createMany({
            data: addedIds.map((permissionId) => ({
              roleId,
              permissionId,
            })),
            skipDuplicates: true,
          });
        }

        if (removedIds.length > 0) {
          await tx.rolePermission.deleteMany({
            where: {
              roleId,
              permissionId: {
                in: removedIds,
              },
            },
          });
        }
      });

      return {
        success: true,
        message: 'Role permissions updated successfully',
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to update permissions for role ${roleId}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update role permissions',
      );
    }
  }
}
