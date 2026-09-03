import { DomainError } from '@shared/kernel/errors/domain-error';

export class PostNotFoundError extends DomainError {
  constructor() {
    super('POST_NOT_FOUND', 404, 'Post not found');
  }
}
