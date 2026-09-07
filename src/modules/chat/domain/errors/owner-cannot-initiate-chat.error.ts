import { DomainError } from '@shared/kernel/errors/domain-error';

export class OwnerCannotInitiateChatError extends DomainError {
  constructor() {
    super(
      'OWNER_CANNOT_INITIATE_CHAT',
      403,
      'Chủ bài đăng không thể chủ động nhắn tin trước, chỉ có thể trả lời sau khi người mua nhắn tin',
    );
  }
}
