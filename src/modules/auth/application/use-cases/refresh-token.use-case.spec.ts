import { createHash } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import {
  RefreshToken,
  TRefreshTokenProps,
} from '../../domain/refresh-token.entity';
import { RefreshTokenNotFoundError } from '../../domain/errors/refresh-token-not-found.error';
import { RefreshTokenRevokedError } from '../../domain/errors/refresh-token-revoked.error';
import { RefreshTokenExpiredError } from '../../domain/errors/refresh-token-expired.error';
import { IRefreshTokenRepository } from '../ports/refresh-token-repository.interface';
import { ITokenIssuer } from '../ports/token-issuer.interface';
import { RefreshTokenUseCase } from './refresh-token.use-case';

const RAW_TOKEN = 'raw-refresh-token';
const TOKEN_HASH = createHash('sha256').update(RAW_TOKEN).digest('hex');

function buildRecord(overrides: Partial<TRefreshTokenProps> = {}) {
  return new RefreshToken({
    id: 'refresh-token-id',
    accountId: 'account-id',
    currentTokenHash: TOKEN_HASH,
    previousTokenHash: null,
    expiredAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    isAlive: true,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

describe('RefreshTokenUseCase', () => {
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
  let tokenIssuer: jest.Mocked<ITokenIssuer>;
  let configService: ConfigService;
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    refreshTokenRepository = {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      update: jest.fn(),
    };
    tokenIssuer = {
      signAccessToken: jest.fn().mockReturnValue('new-access-token'),
      signWsToken: jest.fn().mockReturnValue('new-ws-token'),
    };
    configService = { get: jest.fn().mockReturnValue('7d') } as any;
    useCase = new RefreshTokenUseCase(
      refreshTokenRepository,
      tokenIssuer,
      configService,
    );
  });

  it('throws RefreshTokenNotFoundError when no record matches the hash', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue(null);

    await expect(
      useCase.execute({
        accountId: 'account-id',
        profileId: 'profile-id',
        refreshToken: RAW_TOKEN,
      }),
    ).rejects.toBeInstanceOf(RefreshTokenNotFoundError);
  });

  it('throws RefreshTokenNotFoundError when record belongs to another account', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue(
      buildRecord({ accountId: 'other-account-id' }),
    );

    await expect(
      useCase.execute({
        accountId: 'account-id',
        profileId: 'profile-id',
        refreshToken: RAW_TOKEN,
      }),
    ).rejects.toBeInstanceOf(RefreshTokenNotFoundError);
  });

  it('revokes record and throws RefreshTokenRevokedError on reuse detection', async () => {
    const record = buildRecord({
      currentTokenHash: 'some-other-hash',
      previousTokenHash: TOKEN_HASH,
    });
    refreshTokenRepository.findByTokenHash.mockResolvedValue(record);

    await expect(
      useCase.execute({
        accountId: 'account-id',
        profileId: 'profile-id',
        refreshToken: RAW_TOKEN,
      }),
    ).rejects.toBeInstanceOf(RefreshTokenRevokedError);

    expect(refreshTokenRepository.update).toHaveBeenCalledWith(record);
    expect(record.isAlive).toBe(false);
  });

  it('throws RefreshTokenExpiredError when record is expired', async () => {
    const record = buildRecord({
      expiredAt: new Date(Date.now() - 1000),
    });
    refreshTokenRepository.findByTokenHash.mockResolvedValue(record);

    await expect(
      useCase.execute({
        accountId: 'account-id',
        profileId: 'profile-id',
        refreshToken: RAW_TOKEN,
      }),
    ).rejects.toBeInstanceOf(RefreshTokenExpiredError);
  });

  it('rotates the token and returns a new access/refresh pair on success', async () => {
    const record = buildRecord();
    refreshTokenRepository.findByTokenHash.mockResolvedValue(record);
    refreshTokenRepository.update.mockResolvedValue(record);

    const result = await useCase.execute({
      accountId: 'account-id',
      profileId: 'profile-id',
      refreshToken: RAW_TOKEN,
    });

    expect(tokenIssuer.signAccessToken).toHaveBeenCalledWith({
      accountId: 'account-id',
      profileId: 'profile-id',
    });
    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).not.toBe(RAW_TOKEN);
    expect(refreshTokenRepository.update).toHaveBeenCalledWith(record);
    expect(record.currentTokenHash).not.toBe(TOKEN_HASH);
    expect(record.previousTokenHash).toBe(TOKEN_HASH);
  });
});
