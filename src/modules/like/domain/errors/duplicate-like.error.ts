import { DomainError } from '@shared/kernel/errors/domain-error';

export class DuplicateLikeError extends DomainError {
  constructor() {
    super('DUPLICATE_LIKE', 409, 'Profile đã like post này rồi');
  }
}
