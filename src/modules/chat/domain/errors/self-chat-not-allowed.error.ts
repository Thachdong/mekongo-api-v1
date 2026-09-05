import { DomainError } from '@shared/kernel/errors/domain-error';

export class SelfChatNotAllowedError extends DomainError {
  constructor() {
    super(
      'SELF_CHAT_NOT_ALLOWED',
      400,
      'Bạn không thể tự nhắn tin với chính mình trên bài đăng của mình',
    );
  }
}
