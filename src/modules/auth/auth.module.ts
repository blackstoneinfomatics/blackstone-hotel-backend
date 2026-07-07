import { Module } from '@nestjs/common';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { SessionModule } from './session/session.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from './jwt/jwt.module';
import { RedisModule } from '@/infrastructure/redis/redis.module';
import { JwtAuthGuard } from './authentication/guards/jwt-auth.guard';
import { SessionGuard } from './authentication/guards/session.guard';
import { PassportModule } from '@nestjs/passport';
import { ModuleModule } from './module/module.module';
import { AuthorizationModule } from './authorization/authorization.module';

@Module({
  imports: [
    UsersModule, RolesModule, PermissionsModule, AuthenticationModule, SessionModule, JwtModule,RedisModule, ModuleModule, AuthorizationModule],
})
export class AuthModule {}
