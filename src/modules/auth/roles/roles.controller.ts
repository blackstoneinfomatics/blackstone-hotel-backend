import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, ParseUUIDPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiResponse } from '@/shared/interface/api-response.interface';
import { RoleResponseDto } from './dto/role-response.dto';
import { GetAllRolesDto } from './dto/getall-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { RolePermissionResponseDto } from './dto/role-permission-response.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Controller('roles/v1')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoleDto: CreateRoleDto) : Promise<ApiResponse<RoleResponseDto>> {
    return this.rolesService.create(createRoleDto);
  }

  @Post(':roleId/permissions')
  @HttpCode(HttpStatus.CREATED)
  createRolePermission(@Param('roleId',ParseUUIDPipe) roleId : string , @Body() assignPermission : AssignPermissionsDto){
    return this.rolesService.createRolePermission(roleId,assignPermission);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: GetAllRolesDto) : Promise<ApiResponse<RoleResponseDto[]>> {
    return this.rolesService.findAll(query);
  }

  @Get(':roleId/permissions')
  @HttpCode(HttpStatus.OK)
  findAllRolePermisssion(@Param('roleId',ParseUUIDPipe) roleId : string):Promise<ApiResponse<RolePermissionResponseDto>>{
    return this.rolesService.getRolePermissions(roleId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseUUIDPipe) id: string) : Promise<ApiResponse<RoleResponseDto>> {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Patch(':roleId/permissions')
  @HttpCode(HttpStatus.OK)
  replaceRolePermission(@Param('roleId',ParseUUIDPipe) roleId :string , @Body() replaceDto : UpdateRolePermissionsDto){
    return this.rolesService.updateRolePermissions(roleId, replaceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.GONE)
  remove(@Param('id' , ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
