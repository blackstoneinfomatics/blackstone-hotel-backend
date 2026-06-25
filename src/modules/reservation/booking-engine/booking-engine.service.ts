import { Injectable } from '@nestjs/common';
import { CreateBookingEngineDto } from './dto/create-booking-engine.dto';
import { UpdateBookingEngineDto } from './dto/update-booking-engine.dto';

@Injectable()
export class BookingEngineService {
  create(createBookingEngineDto: CreateBookingEngineDto) {
    return 'This action adds a new bookingEngine';
  }

  findAll() {
    return `This action returns all bookingEngine`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookingEngine`;
  }

  update(id: number, updateBookingEngineDto: UpdateBookingEngineDto) {
    return `This action updates a #${id} bookingEngine`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookingEngine`;
  }
}
