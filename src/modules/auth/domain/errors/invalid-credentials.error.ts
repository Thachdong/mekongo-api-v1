import { DomainError } from '@shared/kernel/errors/domain-error';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('INVALID_CREDENTIALS', 401, 'Invalid credentials');
  }
}
