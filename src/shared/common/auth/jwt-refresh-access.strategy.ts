import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TJwtPayload } from './jwt-payload.type';

@Injectable()
export class JwtRefreshAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-access',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('jwt.accessTokenSecret'),
    });
  }

  validate(payload: TJwtPayload): TJwtPayload {
    return payload;
  }
}
