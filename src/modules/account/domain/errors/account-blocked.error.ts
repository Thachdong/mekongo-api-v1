import { DomainError } from '@shared/kernel/errors/domain-error';

export class AccountBlockedError extends DomainError {
  constructor(blockUntil: Date) {
    super('ACCOUNT_BLOCKED', 403, 'Account is blocked', { blockUntil });
  }
}
