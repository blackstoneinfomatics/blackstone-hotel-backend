import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FrontdeskService } from './frontdesk.service';
import { CreateFrontdeskDto } from './dto/create-frontdesk.dto';
import { UpdateFrontdeskDto } from './dto/update-frontdesk.dto';

@Controller('frontdesk')
export class FrontdeskController {
  constructor(private readonly frontdeskService: FrontdeskService) {}

  @Post()
  create(@Body() createFrontdeskDto: CreateFrontdeskDto) {
    return this.frontdeskService.create(createFrontdeskDto);
  }

  @Get()
  findAll() {
    return this.frontdeskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.frontdeskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFrontdeskDto: UpdateFrontdeskDto) {
    return this.frontdeskService.update(+id, updateFrontdeskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.frontdeskService.remove(+id);
  }
}
