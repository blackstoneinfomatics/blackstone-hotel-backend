import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingEngineDto } from './create-booking-engine.dto';

export class UpdateBookingEngineDto extends PartialType(CreateBookingEngineDto) {}
