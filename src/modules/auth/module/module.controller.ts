import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/CreateModule.dto';
import { UpdateModuleDto } from './dto/UpdateModule.dto';
import { GetModulesDto } from './dto/GetModules.dto';
import { UpdateModuleStatusDto } from './dto/UpdateModuleStatusDto.dto';
import { GetModuleTreeDto } from './dto/GetModuleTreeDto.dto';

@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post('/v1')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleService.create(createModuleDto);
  }

  @Get('/v1')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: GetModulesDto) {
    return this.moduleService.findAll(query);
  }
  
  @Get('/v1/tree')
  @HttpCode(HttpStatus.OK)
  async getTree(@Query() query :GetModuleTreeDto) {
    return this.moduleService.getTree(query);
  }

  @Get('/v1/:id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.moduleService.findById(id);
  }

  @Patch('/v1/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.moduleService.update(id, updateModuleDto);
  }

  @Delete('/v1/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.moduleService.remove(id);
  }

  @Patch('/v1/:id/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateModuleStatusDto,
  ) {
    return this.moduleService.updateStatus(id, updateStatusDto);
  }

}
