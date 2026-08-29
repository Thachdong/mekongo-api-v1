import { DomainError } from '@shared/kernel/errors/domain-error';

export class RefreshTokenRevokedError extends DomainError {
  constructor() {
    super('REFRESH_TOKEN_REVOKED', 401, 'Refresh token is revoked');
  }
}
