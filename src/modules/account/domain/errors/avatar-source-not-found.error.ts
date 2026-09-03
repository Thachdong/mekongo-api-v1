import { DomainError } from '@shared/kernel/errors/domain-error';

export class AvatarSourceNotFoundError extends DomainError {
  constructor() {
    super('AVATAR_SOURCE_NOT_FOUND', 404, 'Avatar source file not found');
  }
}
