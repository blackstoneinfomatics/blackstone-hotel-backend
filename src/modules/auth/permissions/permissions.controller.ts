import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { GetAllPermission } from './dto/getall-permission.dto';
import { ApiResponse } from '@/shared/interface/api-response.interface';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { PermissionModuleGroupDto } from './dto/PermissionModuleGroupDto.dto';

@Controller('permissions/v1')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: GetAllPermission,
  ): Promise<ApiResponse<PermissionModuleGroupDto[]>> {
    return this.permissionsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<PermissionResponseDto>> {
    return this.permissionsService.findOne(id);
  }



  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.deactivate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
