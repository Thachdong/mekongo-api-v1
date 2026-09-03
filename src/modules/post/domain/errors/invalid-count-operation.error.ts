import { DomainError } from '@shared/kernel/errors/domain-error';

export class InvalidCountOperationError extends DomainError {
  constructor(field: string) {
    super(
      'INVALID_COUNT_OPERATION',
      400,
      `${field} không thể giảm xuống dưới 0`,
    );
  }
}
