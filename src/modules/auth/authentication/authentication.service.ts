import {
  BadRequestException,
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
import { ResetUserPasswordDto } from './dto/ResetPasswordDto.dto';
import { UserWithRelations } from '../users/types/UserWithRelations.type';
import { Status } from '@prisma/client';

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

      const getTokenData = { ...user, data };

      return await this.issueTokensAndCreateSession(getTokenData);
    } catch (error: any) {
      this.logger.error(`Failed to fetch permisssions`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Unable to fetch permissions');
    }
  }
  private getEffectiveUserAccess(user: UserWithRelations) {
    const activeUserRoles = user.userRoles.filter(
      (userRole) => !userRole.role.deletedAt && userRole.role.isActive,
    );

    const roleIds = activeUserRoles.map((userRole) => userRole.role.id);

    const permissions = [
      ...new Set(
        activeUserRoles.flatMap((userRole) =>
          userRole.role.rolePermissions
            .filter(
              (rolePermission) =>
                !rolePermission.permission.deletedAt &&
                rolePermission.permission.isActive &&
                !rolePermission.permission.module.deletedAt &&
                rolePermission.permission.module.status === Status.ACTIVE,
            )
            .map((rolePermission) => rolePermission.permission.code),
        ),
      ),
    ];

    return {
      roleIds,
      permissions,
    };
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
      await this.revokeAllForUser(userId);
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
      await this.revokeAllForUser(userId);
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
    } catch (error: any) {
      this.logger.error(`Failed to revoke tokens: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Token revocation failed');
    }
  }

  private async handleRefreshReuse(
    uid: string,
    deviceId: string,
    sessionId: string,
  ) {
    // Strong action: revoke all refresh tokens for user
    await this.revokeAllForUser(uid);
    // Optionally send security email/push, create security incident record
    this.logger.warn(
      `Refresh token reuse detected for uid=${uid}, deviceId=${deviceId}`,
    );
  }

  async revokeAllForUser(uid: string): Promise<boolean> {
    try {
      // Revoke all JWTs issued before this timestamp
      const revokeTimestamp = String(Date.now());

      await this.redis.set(
        RedisKeys.revokedUser(uid),
        revokeTimestamp,
        60 * 60 * 24 * 365,
      );

      // Get all active session IDs
      const sessionIds = await this.redis.smembers(RedisKeys.userSessions(uid));

      await Promise.all(
        sessionIds.map(async (sessionId) => {
          try {
            // Get session details
            const session =
              (await this.activeSession.getById(sessionId)) ||
              this.redis
                .get(RedisKeys.session(sessionId))
                .then((s) => (s ? JSON.parse(s) : null));

            await Promise.all([
              this.redis.del(RedisKeys.refreshToken(sessionId)),
              this.redis.del(RedisKeys.accessToken(sessionId)),
              this.redis.del(RedisKeys.session(sessionId)),
              this.redis.srem(RedisKeys.userSessions(uid), sessionId),

              session?.deviceId
                ? this.redis.srem(RedisKeys.devices(uid), session.deviceId)
                : Promise.resolve(),

              this.activeSession.revokeSession(sessionId),
            ]);
          } catch (error: any) {
            this.logger.error(
              `Failed to revoke session ${sessionId}: ${error.message}`,
            );
          }
        }),
      );

      // Clean up empty sets
      await Promise.all([
        this.redis.del(RedisKeys.userSessions(uid)),
        this.redis.del(RedisKeys.devices(uid)),
      ]);

      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to revoke all sessions for user ${uid}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to logout from all devices.',
      );
    }
  }
  async changePassword(
    userId: string,
    sessionId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const userAuth = user.authProviders.find(
        (auth) => auth.provider === AuthProviderType.EMAIL_PASSWORD,
      );
      if (!userAuth?.passwordHash || !userAuth) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const valid = await argon2.verify(userAuth.passwordHash, currentPassword);

      if (!valid) throw new UnauthorizedException('Invalid Current password.');

      const NewPasswordHash = await argon2.hash(newPassword, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      });

      const updateResult = await this.authProviderRepository.updatePasswordHash(
        userId,
        NewPasswordHash,
      );
      if (!updateResult) {
        throw new InternalServerErrorException('Failed to update password');
      }

      if (user.mustChangePassword) {
        const updatePasswordDetails =
          await this.userService.updatePasswordDetailsByUserId(userId, false);
        if (!updatePasswordDetails) {
          throw new InternalServerErrorException(
            'Failed to update password details',
          );
        }
      }

      const session = await this.activeSession.getById(sessionId);
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      const revokeResult = await this.revokeAllForUser(userId);
      if (!revokeResult) {
        throw new InternalServerErrorException(
          'Failed to revoke sessions after password change',
        );
      }
      const data = {
        deviceId: session.deviceId,
        platform: session.platform,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        appVersion: session.appVersion,
        country: session.country,
      };
      const getTokenData = { ...user, data };
      return await this.issueTokensAndCreateSession(getTokenData);
    } catch (error: any) {
      this.logger.error(
        `Failed to change password for user ${userId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change password.');
    }
  }

  async resetPassword(
    userId: string,
    dtoData: ResetUserPasswordDto,
    currentUser: JwtVerifyClaims,
  ) {
    try {
      const targetUser = await this.userService.findUserById(userId);
      if (!targetUser) {
        throw new NotFoundException('User not found');
      }
      const isSuperAdmin = currentUser.roles.some(
        (role) => role === 'SUPER_ADMIN',
      );
      if (!isSuperAdmin) {
        if (targetUser.tenantId !== currentUser.tenantId) {
          throw new ForbiddenException(
            "You do not have permission to reset this user's password.",
          );
        }
      }
      // if (currentUser.sub === targetUser.id) {
      //   throw new BadRequestException(
      //     'Use Change Password to update your own password.',
      //   );
      // }

      const userAuth = targetUser.authProviders.find(
        (auth) => auth.provider === AuthProviderType.EMAIL_PASSWORD,
      );
      if (!userAuth?.passwordHash || !userAuth) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const samepassword = await argon2.verify(
        userAuth.passwordHash,
        dtoData.newPassword,
      );

      if (samepassword) {
        throw new BadRequestException(
          'New password cannot be the same as the current password.',
        );
      }

      const NewPasswordHash = await argon2.hash(dtoData.newPassword, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      });

      const updateResult = await this.authProviderRepository.updatePasswordHash(
        targetUser.id,
        NewPasswordHash,
      );
      if (!updateResult) {
        throw new InternalServerErrorException('Failed to update password');
      }

      const updatePasswordDetails =
        await this.userService.updatePasswordDetailsByUserId(
          targetUser.id,
          dtoData.forcePasswordChange ?? true,
        );
      if (!updatePasswordDetails) {
        throw new InternalServerErrorException(
          'Failed to update password details',
        );
      }

      const session = await this.activeSession.getById(currentUser.sessionId);
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      const revokeResult = await this.revokeAllForUser(userId);
      if (!revokeResult) {
        throw new InternalServerErrorException(
          'Failed to revoke sessions after password change',
        );
      }
      const data = {
        deviceId: session.deviceId,
        platform: session.platform,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        appVersion: session.appVersion,
        country: session.country,
      };
      const getTokenData = { ...targetUser, data };
      return await this.issueTokensAndCreateSession(getTokenData);
    } catch (error: any) {
      this.logger.error(
        `Failed to change password for user ${userId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change password.');
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
    } catch (error: any) {
      this.logger.error(`Failed to cache session: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
    }
  }
}
