import { DomainError } from '@shared/kernel/errors/domain-error';

export class AccountNotFoundError extends DomainError {
  constructor() {
    super('ACCOUNT_NOT_FOUND', 404, 'Account not found');
  }
}
