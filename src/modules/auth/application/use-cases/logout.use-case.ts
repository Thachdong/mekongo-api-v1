import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { IRefreshTokenRepository } from '../ports/refresh-token-repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../ports/auth-application.tokens';

export type TAuthLogoutInput = {
  accountId: string;
  refreshToken: string;
};

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly _refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: TAuthLogoutInput): Promise<void> {
    const presentedTokenHash = createHash('sha256')
      .update(input.refreshToken)
      .digest('hex');

    const record =
      await this._refreshTokenRepository.findByTokenHash(presentedTokenHash);
    if (!record || record.accountId !== input.accountId || !record.isAlive) {
      return;
    }

    record.revoke();
    await this._refreshTokenRepository.update(record);
  }
}
