import { RefreshToken } from '../../domain/refresh-token.entity';

export interface IRefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<RefreshToken>;
  findByTokenHash(hash: string): Promise<RefreshToken | null>;
  update(refreshToken: RefreshToken): Promise<RefreshToken>;
}
