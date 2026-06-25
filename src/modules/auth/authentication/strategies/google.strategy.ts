import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['openid', 'email', 'profile'],
      passReqToCallback: true,
    });
  }

 async validate( req: any,accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const { id, name, emails, photos } = profile;

      if (!profile.emails?.length) {
        return done(new Error('No email found'), false);
      }
      if (!emails?.[0]?.value || !id) {
        return done(new Error('Invalid Google profile data'), false);
      }

      const user = {
        googleId: id,
        email: emails[0].value,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        picture: photos?.[0]?.value || '',
        accessToken,
        state: req.query.state as string,
      };

     return user  
  } catch (err) {
      done(err, false);
    }
  }
}