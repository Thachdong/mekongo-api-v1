import { DomainError } from '@shared/kernel/errors/domain-error';

export class EmptyChatContentError extends DomainError {
  constructor() {
    super('EMPTY_CHAT_CONTENT', 400, 'Nội dung tin nhắn không được để trống');
  }
}
