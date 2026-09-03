import { DomainError } from '@shared/kernel/errors/domain-error';

export class DuplicateProfileTypeError extends DomainError {
  constructor() {
    super(
      'DUPLICATE_PROFILE_TYPE',
      409,
      'Account đã có profile với profileType này',
    );
  }
}
