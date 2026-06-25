import { Module } from '@nestjs/common';
import { FoliosModule } from './folios/folios.module';
import { BillingModule } from './billing/billing.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { RefundsModule } from './refunds/refunds.module';

@Module({
  imports: [FoliosModule, BillingModule, InvoicesModule, PaymentsModule, RefundsModule]
})
export class FinanceModule {}
