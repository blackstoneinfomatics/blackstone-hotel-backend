import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EMailPasswordLoginRequestDto } from './dto/EmailPasswordLoginRequestDto.dto';
import type { Request, Response } from 'express';
import { EmailPasswordLoginServiceDto } from './dto/EmailPasswordLoginServiceDto.dto';
import { AuthenticationService } from './authentication.service';
import { RefreshTokenRequestDto } from './dto/RefreshTokenRequestDto.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { JwtVerifyClaims } from '../jwt/interfaces/jwtclaims.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SessionGuard } from './guards/session.guard';
import { RedisKeys } from '@/infrastructure/redis/constants/redis-keys';
import { randomUUID } from 'crypto';
import { RedisService } from '@/infrastructure/redis/redis.service';
import passport from 'passport';
import geoip from 'geoip-lite';
import { ChangePasswordDto } from './dto/ChangePasswordDto.dto';
import { ResetUserPasswordDto } from './dto/ResetPasswordDto.dto';

@Controller('authentication')
export class AuthenticationController {
  private readonly logger = new Logger(AuthenticationController.name);
  constructor(
    private readonly authService: AuthenticationService,
    private readonly redis: RedisService,
  ) {}

  @Post('v1/login')
  @HttpCode(HttpStatus.OK)
  async emailPasswordLogin(
    @Body() body: EMailPasswordLoginRequestDto,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress =
      request.ip || (request.headers['x-forwarded-for'] as string) || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';
    const data: EmailPasswordLoginServiceDto = {
      ...body,
      userAgent,
      ipAddress,
    };
    const tokens = await this.authService.emailPasswordLogin(data);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.accessExp * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokens.refreshExp * 1000,
    });

    return {
      success: true,
      message: 'Login successful.',
    };
  }

  @Get('v1/google')
  async googleLogin(
    @Query('deviceId') deviceId: string,
    @Query('platform') platform: string,
    @Query('appVersion') appVersion: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!deviceId || !platform || !appVersion) {
      throw new BadRequestException(
        'deviceId, purpose and appVersion are required.',
      );
    }

    const state = randomUUID();

    await this.redis.set(
      RedisKeys.oAuth(state),
      JSON.stringify({
        deviceId,
        platform,
        appVersion,
      }),
      300,
    );

    passport.authenticate('google', {
      scope: ['openid', 'email', 'profile'],
      session: false,
      state,
      prompt: 'select_account',
    })(req, res);
  }

  @Get('/v1/google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    passport.authenticate(
      'google',
      { session: false },
      async (err: any, googleUser: any, info: any) => {
        try {
          if (err || !googleUser) {
            return res.redirect(
              `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
            );
          }

          const state = req.query.state as string;

          if (!state) {
            throw new BadRequestException('Invalid OAuth state.');
          }

          const stateData = await this.redis.get(RedisKeys.oAuth(state));

          if (!stateData) {
            throw new BadRequestException('OAuth state expired.');
          }

          await this.redis.del(RedisKeys.oAuth(state));

          const oauth =
            typeof stateData === 'string' ? JSON.parse(stateData) : stateData;

          const ipAddress =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ??
            req.ip ??
            '';

          const geo = geoip.lookup(ipAddress);

          const result = await this.authService.googleLogin({
            googleId: googleUser.googleId,
            email: googleUser.email,

            picture: googleUser.picture,

            deviceId: oauth.deviceId,
            platform: oauth.platform,
            appVersion: oauth.appVersion,

            ipAddress,
            userAgent: req.headers['user-agent'] ?? '',
            country: geo?.country ?? '',
          });

          res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
          });

          res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          return res.redirect(
            `${process.env.FRONTEND_URL}/login?success=Login Successfully`,
          );
        } catch (error: any) {
          if (res.headersSent) {
            return;
          }

          if (error instanceof HttpException) {
            const response = error.getResponse();

            const message =
              typeof response === 'string'
                ? response
                : (response as any).message;

            return res.redirect(
              `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
                Array.isArray(message) ? message[0] : message,
              )}`,
            );
          }

          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=authentication_failed`,
          );
        }
      },
    )(req, res);
  }

  @Post('/v1/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: RefreshTokenRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;
    const platform = body.platform;
    const tokens = await this.authService.refreshToken({
      refreshToken,
      platform,
    });

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.accessExp * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokens.refreshExp * 1000,
    });

    return {
      success: true,
      message: 'Token refreshed successfully.',
    };
  }

  @Post('/v1/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, SessionGuard)
  async logout(
    @CurrentUser() user: JwtVerifyClaims,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.revoke(
      user.sub,
      user.sessionId,
      user.jti,
      user.deviceId,
    );

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Post('/v1/logoutall')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, SessionGuard)
  async logoutall(
    @CurrentUser() user: JwtVerifyClaims,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.revokeAllForUser(user.sub);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return {
      success: true,
      message: 'Logged out from all devices',
    };
  }

  @Patch('/v1/change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, SessionGuard)
  async changePassword(
    @CurrentUser() user: JwtVerifyClaims,
    @Body() body: ChangePasswordDto,
  ) {
    await this.authService.changePassword(
      user.sub,
      user.sessionId,
      body.currentPassword,
      body.newPassword,
    );

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  @Patch('/v1/:id/reset-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, SessionGuard)
  async resetPassword(
    @Param('id') id: string,
    @Body() body: ResetUserPasswordDto,
    @CurrentUser() user: JwtVerifyClaims,
  ) {
    await this.authService.resetPassword(id, body, user);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
