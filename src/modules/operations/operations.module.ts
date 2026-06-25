import { Module } from '@nestjs/common';
import { FrontdeskModule } from './frontdesk/frontdesk.module';
import { CheckinModule } from './checkin/checkin.module';
import { CheckoutModule } from './checkout/checkout.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [FrontdeskModule, CheckinModule, CheckoutModule, HousekeepingModule, InventoryModule]
})
export class OperationsModule {}
