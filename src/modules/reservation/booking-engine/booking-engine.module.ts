import { Module } from '@nestjs/common';
import { BookingEngineService } from './booking-engine.service';
import { BookingEngineController } from './booking-engine.controller';

@Module({
  controllers: [BookingEngineController],
  providers: [BookingEngineService],
})
export class BookingEngineModule {}
