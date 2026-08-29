import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { ITokenIssuer } from '../../application/ports/token-issuer.interface';

@Injectable()
export class JwtTokenIssuer implements ITokenIssuer {
  constructor(private readonly _jwtService: JwtService) {}

  signAccessToken(payload: TJwtPayload): string {
    return this._jwtService.sign(payload);
  }
}
