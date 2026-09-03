import { DomainError } from '@shared/kernel/errors/domain-error';

export class CannotDeleteCurrentAddressError extends DomainError {
  constructor() {
    super(
      'CANNOT_DELETE_CURRENT_ADDRESS',
      409,
      'Cannot delete the current address',
    );
  }
}
