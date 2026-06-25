import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RatePlansService } from './rate-plans.service';
import { CreateRatePlanDto } from './dto/create-rate-plan.dto';
import { UpdateRatePlanDto } from './dto/update-rate-plan.dto';

@Controller('rate-plans')
export class RatePlansController {
  constructor(private readonly ratePlansService: RatePlansService) {}

  @Post()
  create(@Body() createRatePlanDto: CreateRatePlanDto) {
    return this.ratePlansService.create(createRatePlanDto);
  }

  @Get()
  findAll() {
    return this.ratePlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratePlansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRatePlanDto: UpdateRatePlanDto) {
    return this.ratePlansService.update(+id, updateRatePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ratePlansService.remove(+id);
  }
}
