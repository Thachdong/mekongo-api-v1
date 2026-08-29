import { DomainError } from '@shared/kernel/errors/domain-error';

export class AccountNotActiveError extends DomainError {
  constructor() {
    super('ACCOUNT_NOT_ACTIVE', 403, 'Account is not active');
  }
}
