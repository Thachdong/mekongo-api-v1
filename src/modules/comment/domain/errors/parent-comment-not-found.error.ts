import { DomainError } from '@shared/kernel/errors/domain-error';

export class ParentCommentNotFoundError extends DomainError {
  constructor() {
    super(
      'PARENT_COMMENT_NOT_FOUND',
      404,
      'Comment cha không tồn tại hoặc không thuộc post này',
    );
  }
}
