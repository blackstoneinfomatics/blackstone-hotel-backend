import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateActiveSessionDto } from './dto/create-session.dto';
import { UpdateJtiSessionDto } from './dto/updateJti-session.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create(@Body() createSessionDto: CreateActiveSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Get()
  findAll() {
    return this.sessionService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.sessionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSessionDto: UpdateJtiSessionDto) {
  //   return this.sessionService.update(id, updateSessionDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionService.remove(+id);
  }
}
