import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenNotFoundError } from '../../domain/errors/refresh-token-not-found.error';
import { RefreshTokenRevokedError } from '../../domain/errors/refresh-token-revoked.error';
import { ITokenIssuer } from '../ports/token-issuer.interface';
import { IRefreshTokenRepository } from '../ports/refresh-token-repository.interface';
import {
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_ISSUER,
} from '../ports/auth-application.tokens';

export type TAuthRefreshTokenInput = {
  accountId: string;
  profileId: string | null;
  refreshToken: string;
};

export type TAuthRefreshTokenOutput = {
  accessToken: string;
  refreshToken: string;
};

const DURATION_UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

function parseDurationMs(duration: string): number {
  const match = /^(\d+)(ms|s|m|h|d)?$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }
  return Number(match[1]) * DURATION_UNIT_MS[match[2] ?? 'ms'];
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly _refreshTokenRepository: IRefreshTokenRepository,
    @Inject(TOKEN_ISSUER)
    private readonly _tokenIssuer: ITokenIssuer,
    private readonly _configService: ConfigService,
  ) {}

  async execute(
    input: TAuthRefreshTokenInput,
  ): Promise<TAuthRefreshTokenOutput> {
    const presentedTokenHash = createHash('sha256')
      .update(input.refreshToken)
      .digest('hex');

    const record =
      await this._refreshTokenRepository.findByTokenHash(presentedTokenHash);
    if (!record || record.accountId !== input.accountId) {
      throw new RefreshTokenNotFoundError();
    }

    if (record.checkReusedDetected(presentedTokenHash)) {
      await this._refreshTokenRepository.update(record);
      throw new RefreshTokenRevokedError();
    }

    const newRawToken = randomBytes(32).toString('hex');
    const newTokenHash = createHash('sha256').update(newRawToken).digest('hex');
    const refreshTokenExpiredIn = this._configService.get<string>(
      'jwt.refreshTkenExpiredIn',
      '7d',
    );
    const newExpiredAt = new Date(
      Date.now() + parseDurationMs(refreshTokenExpiredIn),
    );

    record.renew(newTokenHash, newExpiredAt);
    await this._refreshTokenRepository.update(record);

    const accessToken = this._tokenIssuer.signAccessToken({
      accountId: input.accountId,
      profileId: input.profileId,
    });

    return {
      accessToken,
      refreshToken: newRawToken,
    };
  }
}
