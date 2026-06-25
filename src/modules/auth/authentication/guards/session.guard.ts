import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { RedisService } from '@/infrastructure/redis/redis.service';
import { RedisKeys } from '@/infrastructure/redis/constants/redis-keys';
import { SessionService } from '@/modules/auth/session/session.service';
import { hashJti } from '@/shared/utils/hash-jti';
import { JwtVerifyClaims } from '../../jwt/interfaces/jwtclaims.interface';

@Injectable()
export class SessionGuard implements CanActivate {
  private readonly logger = new Logger(SessionGuard.name);

  constructor(
    private readonly redis: RedisService,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try {

      const request = context.switchToHttp().getRequest();

      const user = request.user as JwtVerifyClaims;

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

      /**
       * Global Logout
       */
      const revokedAt = await this.redis.get(
        RedisKeys.revokedUser(user.sub),
      );

      if (revokedAt && user.iat < Number(revokedAt)) {
        throw new UnauthorizedException(
          'Token has been globally revoked',
        );
      }

      /**
       * JTI Validation
       */
      const incomingHash = hashJti(user.jti);

      const redisKey = RedisKeys.accessToken(user.sessionId);

      const cachedHash = await this.redis.get(redisKey);

      if (cachedHash) {
        if (cachedHash !== incomingHash) {
          throw new UnauthorizedException(
            'Token revoked',
          );
        }

        return true;
      }

      /**
       * Database Validation
       */
      const session = await this.sessionService.getById(
        user.sessionId,
      );

      if (!session) {
        throw new UnauthorizedException(
          'Session not found',
        );
      }

      if (session.deletedAt) {
        throw new UnauthorizedException(
          'Session deleted',
        );
      }

      if (session.isRevoked) {
        throw new UnauthorizedException(
          'Session revoked',
        );
      }

      if (
        hashJti(session.accessTokenJti ?? '') !==
        incomingHash
      ) {
        throw new UnauthorizedException(
          'Invalid access token',
        );
      }

      /**
       * Warm Redis Cache
       */
      await this.redis.set(
        redisKey,
        incomingHash,
        60 * 15,
      );

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        'Session validation failed',
        error instanceof Error ? error.stack : String(error),
      );

      throw new UnauthorizedException(
        'Session validation failed',
      );
    }
  }
}