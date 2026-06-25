import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { JwtVerifyClaims } from '../../jwt/interfaces/jwtclaims.interface';


@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    private readonly configService: ConfigService,
  ) {
     const publicKey = configService
      .getOrThrow<string>('JWT_PUBLIC_KEY')
      .replace(/\\n/g, '\n');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request?.cookies?.accessToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtVerifyClaims): Promise<JwtVerifyClaims> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (!payload.sessionId) {
      throw new UnauthorizedException('Invalid session');
    }

    if (!payload.deviceId) {
      throw new UnauthorizedException('Invalid device');
    }

    return payload;
  }
}