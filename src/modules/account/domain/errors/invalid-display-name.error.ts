import { DomainError } from '@shared/kernel/errors/domain-error';

export class InvalidDisplayNameError extends DomainError {
  constructor() {
    super(
      'INVALID_DISPLAY_NAME',
      422,
      'Display name must be at least 5 characters',
    );
  }
}
