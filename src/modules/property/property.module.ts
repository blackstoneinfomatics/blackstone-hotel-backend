import { Module } from '@nestjs/common';
import { PropertiesModule } from './properties/properties.module';
import { RoomsModule } from './rooms/rooms.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { RatePlansModule } from './rate-plans/rate-plans.module';
import { AmenitiesModule } from './amenities/amenities.module';

@Module({
  imports: [PropertiesModule, RoomsModule, RoomTypesModule, RatePlansModule, AmenitiesModule]
})
export class PropertyModule {}
