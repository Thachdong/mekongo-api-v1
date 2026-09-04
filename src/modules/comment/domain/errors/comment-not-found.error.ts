import { DomainError } from '@shared/kernel/errors/domain-error';

export class CommentNotFoundError extends DomainError {
  constructor() {
    super('COMMENT_NOT_FOUND', 404, 'Comment không tồn tại');
  }
}
