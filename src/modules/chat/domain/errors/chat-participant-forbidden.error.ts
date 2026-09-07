import { DomainError } from '@shared/kernel/errors/domain-error';

export class ChatParticipantForbiddenError extends DomainError {
  constructor() {
    super(
      'CHAT_PARTICIPANT_FORBIDDEN',
      403,
      'Bạn không có quyền truy cập cuộc trò chuyện này',
    );
  }
}
