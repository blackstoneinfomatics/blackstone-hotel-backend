import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingEngineService } from './booking-engine.service';
import { CreateBookingEngineDto } from './dto/create-booking-engine.dto';
import { UpdateBookingEngineDto } from './dto/update-booking-engine.dto';

@Controller('booking-engine')
export class BookingEngineController {
  constructor(private readonly bookingEngineService: BookingEngineService) {}

  @Post()
  create(@Body() createBookingEngineDto: CreateBookingEngineDto) {
    return this.bookingEngineService.create(createBookingEngineDto);
  }

  @Get()
  findAll() {
    return this.bookingEngineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingEngineService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingEngineDto: UpdateBookingEngineDto) {
    return this.bookingEngineService.update(+id, updateBookingEngineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingEngineService.remove(+id);
  }
}
