import { DomainError } from '@shared/kernel/errors/domain-error';

export class InvalidCurrentPasswordError extends DomainError {
  constructor() {
    super('INVALID_CURRENT_PASSWORD', 401, 'Current password is incorrect');
  }
}
