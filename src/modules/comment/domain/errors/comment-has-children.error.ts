import { DomainError } from '@shared/kernel/errors/domain-error';

export class CommentHasChildrenError extends DomainError {
  constructor() {
    super(
      'COMMENT_HAS_CHILDREN',
      422,
      'Comment còn phản hồi, phải xóa hết phản hồi trước',
    );
  }
}
