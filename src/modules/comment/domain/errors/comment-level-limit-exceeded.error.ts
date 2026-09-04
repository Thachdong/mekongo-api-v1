import { DomainError } from '@shared/kernel/errors/domain-error';

export class CommentLevelLimitExceededError extends DomainError {
  constructor() {
    super(
      'COMMENT_LEVEL_LIMIT_EXCEEDED',
      422,
      'Đã đạt giới hạn độ sâu reply tối đa cho comment',
    );
  }
}
