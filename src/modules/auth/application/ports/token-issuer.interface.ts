import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';

export interface ITokenIssuer {
  signAccessToken(payload: TJwtPayload): string;
}
