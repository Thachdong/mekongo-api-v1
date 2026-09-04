import { DomainError } from '@shared/kernel/errors/domain-error';

export class ForbiddenCommentDeletionError extends DomainError {
  constructor() {
    super('FORBIDDEN_COMMENT_DELETION', 403, 'Không có quyền xóa comment này');
  }
}
