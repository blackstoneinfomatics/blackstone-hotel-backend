import { Module } from '@nestjs/common';
import { NotificationsModule } from './notifications/notifications.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [NotificationsModule, WebhooksModule, AuditLogsModule, ReportsModule]
})
export class PlatformModule {}
