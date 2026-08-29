import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type IFindAccountByIdentifierUseCase,
  FIND_ACCOUNT_BY_IDENTIFIER_USECASE,
} from '@modules/account/public-api';
import { PASSWORD_HASHER } from '@shared/common/hashing/hashing.tokens';
import { IPasswordHasher } from '@shared/common/hashing/password-hasher.interface';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { RefreshToken } from '../../domain/refresh-token.entity';
import { ITokenIssuer } from '../ports/token-issuer.interface';
import { IRefreshTokenRepository } from '../ports/refresh-token-repository.interface';
import {
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_ISSUER,
} from '../ports/auth-application.tokens';

export type TAuthLoginInput = {
  loginType: 'EMAIL' | 'PHONE';
  identifier: string;
  password: string;
};

export type TAuthLoginOutput = {
  accessToken: string;
  refreshToken: string;
  accountId: string;
  profileId: string | null;
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
export class LoginUseCase {
  constructor(
    @Inject(FIND_ACCOUNT_BY_IDENTIFIER_USECASE)
    private readonly _findAccountByIdentifierUseCase: IFindAccountByIdentifierUseCase,
    @Inject(PASSWORD_HASHER)
    private readonly _passwordHasher: IPasswordHasher,
    @Inject(TOKEN_ISSUER)
    private readonly _tokenIssuer: ITokenIssuer,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly _refreshTokenRepository: IRefreshTokenRepository,
    private readonly _configService: ConfigService,
  ) {}

  async execute(input: TAuthLoginInput): Promise<TAuthLoginOutput> {
    const { account } = await this._findAccountByIdentifierUseCase.execute({
      identifier: input.identifier,
    });

    account.assertIsActive();
    account.assertNotBlocked();

    const isPasswordMatch = await this._passwordHasher.verify(
      input.password,
      account.passwordHash,
    );
    if (!isPasswordMatch) {
      throw new InvalidCredentialsError();
    }

    const accessToken = this._tokenIssuer.signAccessToken({
      accountId: account.id as string,
      profileId: account.activeProfileId,
    });

    const rawRefreshToken = randomBytes(32).toString('hex');
    const refreshTokenHash = createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const refreshTokenExpiredIn = this._configService.get<string>(
      'jwt.refreshTkenExpiredIn',
      '7d',
    );
    const expiredAt = new Date(
      Date.now() + parseDurationMs(refreshTokenExpiredIn),
    );

    await this._refreshTokenRepository.create(
      new RefreshToken({
        id: null,
        accountId: account.id as string,
        currentTokenHash: refreshTokenHash,
        previousTokenHash: null,
        expiredAt,
        revokedAt: null,
        isAlive: true,
        createdAt: null,
        updatedAt: null,
      }),
    );

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      accountId: account.id as string,
      profileId: account.activeProfileId,
    };
  }
}
