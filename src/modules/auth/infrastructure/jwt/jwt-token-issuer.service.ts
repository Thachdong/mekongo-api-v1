import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WS_JWT_SERVICE } from '@shared/websocket/ws-jwt.tokens';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { ITokenIssuer } from '../../application/ports/token-issuer.interface';

@Injectable()
export class JwtTokenIssuer implements ITokenIssuer {
  constructor(
    private readonly _jwtService: JwtService,
    @Inject(WS_JWT_SERVICE)
    private readonly _wsJwtService: JwtService,
  ) {}

  signAccessToken(payload: TJwtPayload): string {
    return this._jwtService.sign(payload);
  }

  signWsToken(payload: TJwtPayload): string {
    return this._wsJwtService.sign(payload);
  }
}
