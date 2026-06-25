import { Global, Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtModule } from '../jwt/jwt.module';
import { UsersModule } from '../users/users.module';
import { SessionModule } from '../session/session.module';
import { RedisModule } from '@/infrastructure/redis/redis.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SessionGuard } from './guards/session.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthProviderRepository } from './repositories/authprovider.repository';
import { GoogleStrategy } from './strategies/google.strategy';

@Global()
@Module({
  imports: [
    PassportModule.register({
       session: false,
    }),
    JwtModule,
    UsersModule,
    SessionModule,
    RedisModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, JwtAuthGuard, SessionGuard, JwtStrategy,AuthProviderRepository,GoogleStrategy],
  exports: [PassportModule, JwtStrategy, JwtAuthGuard, SessionGuard],
})
export class AuthenticationModule {}
