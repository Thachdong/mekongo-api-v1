import { DomainError } from '@shared/kernel/errors/domain-error';

export class ProfileNotFoundError extends DomainError {
  constructor() {
    super('PROFILE_NOT_FOUND', 404, 'Profile not found');
  }
}
