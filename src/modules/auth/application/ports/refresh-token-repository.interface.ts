import { RefreshToken } from '../../domain/refresh-token.entity';

export interface IRefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<RefreshToken>;
}
