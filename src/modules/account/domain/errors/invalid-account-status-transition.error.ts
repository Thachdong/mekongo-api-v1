import { DomainError } from '@shared/kernel/errors/domain-error';
import { TAccountStatus } from '../value-objects/account-status.enum';

export class InvalidAccountStatusTransitionError extends DomainError {
  constructor(from: TAccountStatus, to: TAccountStatus) {
    super(
      'INVALID_ACCOUNT_STATUS_TRANSITION',
      400,
      `Cannot transition account status from ${from} to ${to}`,
      { from, to },
    );
  }
}
