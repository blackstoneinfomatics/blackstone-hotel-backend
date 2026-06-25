import { Module } from '@nestjs/common';
import { GuestsModule } from './guests/guests.module';
import { BookingsModule } from './bookings/bookings.module';
import { BookingEngineModule } from './booking-engine/booking-engine.module';
import { AvailabilityModule } from './availability/availability.module';

@Module({
  imports: [GuestsModule, BookingsModule, BookingEngineModule, AvailabilityModule]
})
export class ReservationModule {}
