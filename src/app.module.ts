import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { PropertyModule } from './modules/property/property.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { OperationsModule } from './modules/operations/operations.module';
import { FinanceModule } from './modules/finance/finance.module';
import { PlatformModule } from './modules/platform/platform.module';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { MessagingModule } from './infrastructure/messaging/messaging.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { WebsocketModule } from './infrastructure/websocket/websocket.module';
import { envValidationSchema } from './config/env.validation';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { LoggerModule } from 'nestjs-pino';
import { RedisModule } from './infrastructure/redis/redis.module';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRoot({
  pinoHttp: {
    autoLogging: false,
    transport: {
      target: 'pino-pretty',
    },
  },
}),
    AuthModule, TenantModule, PropertyModule, ReservationModule, OperationsModule, FinanceModule, PlatformModule, SharedModule, DatabaseModule, CacheModule, MessagingModule, StorageModule, MailModule, WebsocketModule, LoggerModule ,PrismaModule, RedisModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
