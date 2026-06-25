import { Module } from '@nestjs/common';
import { TenantsModule } from './tenants/tenants.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { FeaturesModule } from './features/features.module';

@Module({
  imports: [TenantsModule, PlansModule, SubscriptionsModule, FeaturesModule]
})
export class TenantModule {}
