import { DomainError } from '@shared/kernel/errors/domain-error';

export class MaxProfileLimitReachedError extends DomainError {
  constructor() {
    super(
      'MAX_PROFILE_LIMIT_REACHED',
      422,
      'Account đã đạt giới hạn tối đa 3 profile',
    );
  }
}
