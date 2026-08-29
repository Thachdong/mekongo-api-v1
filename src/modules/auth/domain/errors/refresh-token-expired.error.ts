import { DomainError } from '@shared/kernel/errors/domain-error';

export class RefreshTokenExpiredError extends DomainError {
  constructor() {
    super('REFRESH_TOKEN_EXPIRED', 401, 'Refresh token is expired');
  }
}
