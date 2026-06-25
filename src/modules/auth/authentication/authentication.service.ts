import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { SignTokensRequestDto } from './dto/SignTokensRequestDto.dto';
import { SignTokensResponseDto } from './dto/SignTokensResponseDto.dto';
import {
  BaseClaims,
  JwtClaims,
  JwtVerifyClaims,
} from '../jwt/interfaces/jwtclaims.interface';
import { EmailPasswordLoginServiceDto } from './dto/EmailPasswordLoginServiceDto.dto';
import { UsersService } from '../users/users.service';
import { UserStatus } from '@/shared/enums/UserStatus.enum';
import * as argon2 from 'argon2';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { hashJti } from '@/shared/utils/hash-jti';
import { RedisKeys } from '@/infrastructure/redis/constants/redis-keys';
import { SessionService } from '../session/session.service';
import { CreateActiveSessionDto } from '../session/dto/create-session.dto';
import { randomUUID } from 'crypto';
import { GetActiveSessionByIdResponse } from '../session/interfaces/getSession.interface';
import { IssueTokensAndCreateSessionResponseDto } from './dto/IssueTokensAndCreateSessionResponseDto.dto';
import { GetTokenDto } from './dto/GetToken.dto';
import { GoogleOAuthLoginDto } from './dto/GoogleLoginServiceLayerDto.dto';
import { AuthProviderRepository } from './repositories/authprovider.repository';
import { AuthProviderType } from '@/shared/enums/AuthProviderType.enum';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly redis: RedisService,
    private readonly activeSession: SessionService,
    private readonly authProviderRepository: AuthProviderRepository,
  ) {}

  async getSignToken(
    req: SignTokensRequestDto,
  ): Promise<SignTokensResponseDto> {
    const { subject, audience, accessTtlSec, refreshTtlSec, deviceId, claims } =
      req;

    const accessClaims: JwtClaims = { ...claims, tokenType: 'access' };
    const refreshClaims: JwtClaims = { ...claims, tokenType: 'refresh' };

    const access = await this.jwtService.signAccessToken(accessClaims || {}, {
      sub: subject!,
      aud: audience!,
      ttlSec: accessTtlSec!,
      deviceId,
    });

    const refresh = await this.jwtService.signAccessToken(refreshClaims || {}, {
      sub: subject!,
      aud: audience!,
      ttlSec: refreshTtlSec!,
      deviceId,
    });

    return {
      accessToken: access.jwt,
      refreshToken: refresh.jwt,
      kid: this.jwtService.getKid(),
      accessJti: access.jti,
      refreshJti: refresh.jti,
      accessExp: access.exp,
      refreshExp: refresh.exp,
    };
  }

  async emailPasswordLogin(
    data: EmailPasswordLoginServiceDto,
  ): Promise<IssueTokensAndCreateSessionResponseDto> {
    try {
      if (!data.email && !data.password) {
        throw new NotFoundException('no email and password');
      }
      const user = await this.userService.findUserByEmailAndPassword(
        data.email,
      );

      if (!user) throw new UnauthorizedException('Invalid email or password.');

      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException('User is inactive.');
      }
      const userAuth = user.authProviders.find(
        (auth) => auth.provider === AuthProviderType.EMAIL_PASSWORD,
      );

      if (!userAuth?.passwordHash) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const valid = await argon2.verify(userAuth.passwordHash, data.password);

      if (!valid) throw new UnauthorizedException('Invalid email or password.');

      const roleIds = user.userRoles.map((ur) => ur.role.id);

      const permissions = [
        ...new Set(
          user.userRoles.flatMap((ur) =>
            ur.role.rolePermissions.map((rp) => rp.permission.code),
          ),
        ),
      ];
      const tenantKey = user.tenantId ?? 'system';
      await this.redis.set(
        RedisKeys.userPermissions(tenantKey, user.id),
        JSON.stringify(permissions),
        3600,
      );

      await this.redis.set(
        RedisKeys.userRoles(tenantKey, user.id),
        JSON.stringify(roleIds),
        3600,
      );
      const getTokenData = { ...user, data };

      return await this.issueTokensAndCreateSession(getTokenData);
    } catch (error: any) {
      this.logger.error(`Failed to fetch permisssions`, error.stack);

      throw new InternalServerErrorException('Unable to fetch permissions');
    }
  }

  async googleLogin(
    data: GoogleOAuthLoginDto,
  ): Promise<IssueTokensAndCreateSessionResponseDto> {
    try {
      if (!data.email && !data.deviceId && !data.platform) {
        throw new NotFoundException('Field invalid');
      }
      const user = await this.userService.findUserByEmail(data.email);

      if (!user) {
        throw new NotFoundException({
          message: 'Account not found.',
          email: data.email,
        });
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException('User is inactive.');
      }
      const userAuth = user.authProviders.find(
        (auth) => auth.provider === AuthProviderType.GOOGLE,
      );

      if (!userAuth!.providerUserId) {
        await this.authProviderRepository.createGoogle(
          user.id,
          AuthProviderType.GOOGLE,
          data.googleId,
        );
      } else if (userAuth!.providerUserId !== data.googleId) {
        throw new UnauthorizedException('Google account mismatch.');
      }
      const roleIds = user.userRoles.map((ur) => ur.role.id);

      const permissions = [
        ...new Set(
          user.userRoles.flatMap((ur) =>
            ur.role.rolePermissions.map((rp) => rp.permission.code),
          ),
        ),
      ];
      const tenantKey = user.tenantId ?? 'system';
      await this.redis.set(
        RedisKeys.userPermissions(tenantKey, user.id),
        JSON.stringify(permissions),
        3600,
      );

      await this.redis.set(
        RedisKeys.userRoles(tenantKey, user.id),
        JSON.stringify(roleIds),
        3600,
      );
      const getTokenData = { ...user, data };

      return await this.issueTokensAndCreateSession(getTokenData);
    } catch (error) {
      this.logger.error(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Unable to complete Google login.',
      );
    }
  }

  async issueTokensAndCreateSession(
    user: any,
  ): Promise<IssueTokensAndCreateSessionResponseDto> {
    const sessionId = randomUUID();
    const uid = user.id;

    const claims: BaseClaims = {
      name: user.displayName,
      email: user.email,
      roles: user.userRoles.map((r) => r.role.code),
      tenantId: user.tenantId,
      roleIds: user.userRoles.map((r) => r.roleId),
      sessionId,

      platform: user.data.platform,
      deviceId: user.data.deviceId,
    };

    const signResp = await this.getSignToken({
      subject: uid,
      issuer: process.env.JWT_ISSUER,
      audience: user.data.platform,
      claims,
      accessTtlSec: Number(process.env.ACCESS_TTL) || 60 * 15,
      refreshTtlSec: Number(process.env.REFRESH_TTL) || 60 * 60 * 24 * 30,
      deviceId: user.data.deviceId,
    });

    const refreshJti = signResp.refreshJti;
    const refreshExp =
      Number(signResp.refreshExp) ||
      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    const ttl = refreshExp - Math.floor(Date.now() / 1000);

    const hashedRefresh = hashJti(refreshJti!);
    const hashedAccess = hashJti(signResp.accessJti!);

    const accessTtl = Number(process.env.ACCESS_TTL) || 60 * 15;

    const activeSessionData: CreateActiveSessionDto = {
      id: sessionId,
      tenantId: user.tenantId,
      userId: user.id,

      platform: user.data.platform,
      deviceId: user.data.deviceId,

      accessTokenJti: signResp.accessJti!,
      refreshTokenJti: signResp.refreshJti!,
      refreshExpiresAt: new Date(Number(signResp.refreshExp) * 1000),

      ipAddress: user.data.ipAddress ?? 'unknown',
      userAgent: user.data.userAgent ?? 'unknown',
      appVersion: user.data.appVersion ?? 'unknown',
      country: user.data.country ?? 'unknown',

      isRevoked: false,
    };

    await this.activeSession.create(activeSessionData);
    this.logger.debug(
      `✅ Active session created for user ${uid} on device ${user.data.deviceId}`,
    );

    const updatedSession = await this.activeSession.getById(sessionId);

    await this.cacheActiveSession(updatedSession);

    await Promise.all([
      this.redis.set(RedisKeys.accessToken(sessionId), hashedAccess, accessTtl),
      this.redis.set(RedisKeys.refreshToken(sessionId), hashedRefresh, ttl),
      this.redis.sadd(RedisKeys.userSessions(uid), sessionId),
      this.redis.sadd(RedisKeys.devices(uid), user.data.deviceId),
      this.redis.del(RedisKeys.revokedUser(uid)),
    ]);

    this.logger.debug(
      `✅ Cleared global revoked timestamp for user ${user.id}`,
    );

    return {
      accessToken: signResp.accessToken!,
      refreshToken: signResp.refreshToken!,
      accessExp: accessTtl,
      refreshExp: ttl,
    };
  }

  async refreshToken(
    body: GetTokenDto,
  ): Promise<IssueTokensAndCreateSessionResponseDto> {
    const verifyResp = await this.jwtService.verifyToken<JwtVerifyClaims>(
      body.refreshToken,
      body.platform,
    );

    if (!verifyResp.ok) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const payload = verifyResp.payload;

    const {
      sessionId,
      tenantId,
      roleIds,
      roles,
      deviceId,
      platform,
      email,
      name,
    } = payload;

    const userId = payload.sub ?? payload['sub'];
    const jti = payload.jti ?? payload['jti'];

    const iat = Number(payload.iat);
    const typ = payload.tokenType ?? '';
    if (typ !== 'refresh') {
      throw new UnauthorizedException('Token is not a refresh token');
    }

    let session: any = null;

    try {
      const sessionJson = await this.redis.get(RedisKeys.session(sessionId));

      session =
        typeof sessionJson === 'string' ? JSON.parse(sessionJson) : sessionJson;

      if (!session) {
        this.logger.warn(
          `No active session in cache for uid=${userId}, deviceId=${deviceId || 'unknown'}`,
        );
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Redis session retrieval failed: ${errMsg}`);
    }

    if (!session) {
      session = await this.activeSession.getById(sessionId);
    }

    if (!session) {
      throw new UnauthorizedException('Active session not found');
    }

    let revokedTimestamp = 0;

    try {
      const revokedTimestampStr = await this.redis.get(
        RedisKeys.revokedUser(userId),
      );
      revokedTimestamp = revokedTimestampStr ? Number(revokedTimestampStr) : 0;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Redis revoked timestamp fetch failed: ${errMsg}`);

      revokedTimestamp = session.revokedAt
        ? Math.floor(new Date(session.revokedAt).getTime() / 1000)
        : 0;
    }

    if (iat < revokedTimestamp) {
      throw new UnauthorizedException('Token globally revoked');
    }

    let storedHash: string | null = null;

    try {
      storedHash = await this.redis.get(RedisKeys.refreshToken(sessionId));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Redis refresh hash retrieval failed: ${errMsg}`);

      storedHash = hashJti(session.refreshTokenJti);
    }

    if (!storedHash) {
      await this.revokeAllForUser(userId, sessionId);
      throw new UnauthorizedException(
        'Refresh token invalid or missing — re-login required',
      );
    }

    const incomingHash = hashJti(jti);

    let isBlacklisted: string | null = null;

    try {
      isBlacklisted = await this.redis.get(
        RedisKeys.refreshBlacklist(incomingHash),
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Redis blacklist check failed: ${errMsg}`);
    }

    if (isBlacklisted === '1') {
      if (storedHash !== incomingHash) {
        await this.handleRefreshReuse(userId, deviceId || 'unknown', sessionId);
        throw new UnauthorizedException(
          'Token reuse detected — all sessions revoked',
        );
      }
      throw new UnauthorizedException('Refresh token blacklisted');
    }

    if (storedHash !== incomingHash) {
      await this.revokeAllForUser(userId, sessionId);
      throw new UnauthorizedException(
        'Refresh token mismatch — re-login required',
      );
    }
    const claims: BaseClaims = {
      name,
      email,
      tenantId,
      roleIds,
      roles,
      sessionId,
      deviceId,
      platform,
    };

    const newResp = await this.getSignToken({
      subject: userId,
      issuer: process.env.JWT_ISSUER,
      audience: platform,
      claims,
      accessTtlSec: Number(process.env.ACCESS_TTL || 60 * 15),
      refreshTtlSec: Number(process.env.REFRESH_TTL || 60 * 60 * 24 * 30),
      deviceId: deviceId || 'unknown',
    });

    if (
      !newResp.accessToken ||
      !newResp.refreshToken ||
      !newResp.accessJti ||
      !newResp.refreshJti
    ) {
      throw new InternalServerErrorException('Failed to generate new tokens');
    }

    const newRefreshJti = newResp.refreshJti;
    const newAccessJti = newResp.accessJti;

    const oldHashed = storedHash;
    const newHashed = hashJti(newRefreshJti);
    const newAccessHashed = hashJti(newAccessJti);

    const refreshTtl = Math.max(
      Number(newResp.refreshExp) - Math.floor(Date.now() / 1000),
      1,
    );

    const accessTtl = Number(process.env.ACCESS_TTL) || 60 * 15;

    await this.activeSession.updateJti(sessionId, {
      accessTokenJti: newAccessJti,
      refreshTokenJti: newRefreshJti,
    });

    await Promise.all([
      this.redis.set(RedisKeys.refreshToken(sessionId), newHashed, refreshTtl),
      this.redis.set(RedisKeys.refreshBlacklist(oldHashed!), '1', refreshTtl),
      this.redis.set(
        RedisKeys.accessToken(sessionId),
        newAccessHashed,
        accessTtl,
      ),
    ]);

    const updatedSession = await this.activeSession.getById(sessionId);

    await this.cacheActiveSession(updatedSession);

    return {
      accessToken: newResp.accessToken,
      refreshToken: newResp.refreshToken,
      accessExp: accessTtl,
      refreshExp: refreshTtl,
    };
  }

  async revoke(
    uid: string,
    sessionId: string,
    jti?: string,
    deviceId?: string,
  ): Promise<boolean> {
    try {
      if (jti) {
        const hashed = hashJti(jti);
        await this.redis.set(
          RedisKeys.refreshBlacklist(hashed),
          '1',
          60 * 60 * 24 * 30,
        );
      }

      if (deviceId) {
        await Promise.all([
          this.redis.del(RedisKeys.refreshToken(sessionId)),
          this.redis.del(RedisKeys.accessToken(sessionId)),
          this.redis.srem(RedisKeys.devices(uid), deviceId),
          this.redis.del(RedisKeys.session(sessionId)),
          this.redis.srem(RedisKeys.userSessions(uid), sessionId),
          this.activeSession.revokeSession(sessionId),
        ]);

        const updatedSession = await this.activeSession.getById(sessionId);
        await this.cacheActiveSession(updatedSession);
      }

      return true;
    } catch (err: any) {
      this.logger.error(`Failed to revoke tokens: ${err.message}`);
      throw new InternalServerErrorException('Token revocation failed');
    }
  }

  private async handleRefreshReuse(
    uid: string,
    deviceId: string,
    sessionId: string,
  ) {
    // Strong action: revoke all refresh tokens for user
    await this.revokeAllForUser(uid, sessionId);
    // Optionally send security email/push, create security incident record
    this.logger.warn(
      `Refresh token reuse detected for uid=${uid}, deviceId=${deviceId}`,
    );
  }

  async revokeAllForUser(uid: string, sessionId: string): Promise<boolean> {
    try {
      const revokeTimestamp = String(Date.now());
      await this.redis.set(
        RedisKeys.revokedUser(uid),
        revokeTimestamp,
        60 * 60 * 24 * 365,
      );

      const devices = await this.redis.smembers(RedisKeys.devices(uid));

      await Promise.all(
        devices.map(async (deviceId) => {
          await Promise.all([
            this.redis.del(RedisKeys.refreshToken(sessionId)),
            this.redis.del(RedisKeys.accessToken(sessionId)),
            this.redis.srem(RedisKeys.devices(uid), deviceId),
            this.redis.del(RedisKeys.session(sessionId)),
            this.redis.srem(RedisKeys.userSessions(uid), sessionId),
            this.activeSession.revokeSession(sessionId),
          ]);

          const updatedSession = await this.activeSession.getById(sessionId);
          await this.cacheActiveSession(updatedSession);
        }),
      );

      return true;
    } catch (err: any) {
      this.logger.error(
        `Failed to revoke all sessions for user ${uid}: ${err.message}`,
      );
      throw new InternalServerErrorException('Complete user revocation failed');
    }
  }
  async cacheActiveSession(data: GetActiveSessionByIdResponse): Promise<void> {
    try {
      const ttl = 60 * 60 * 24 * 30;

      await this.redis.set(
        RedisKeys.session(data.id),
        JSON.stringify(data),
        ttl,
      );

      await this.redis.sadd(RedisKeys.userSessions(data.userId), data.id);
    } catch (err: any) {
      this.logger.error(`Failed to cache session: ${err.message}`);
    }
  }
}
