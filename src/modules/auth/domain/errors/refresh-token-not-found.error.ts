import { DomainError } from '@shared/kernel/errors/domain-error';

export class RefreshTokenNotFoundError extends DomainError {
  constructor() {
    super('REFRESH_TOKEN_NOT_FOUND', 401, 'Refresh token not found');
  }
}
