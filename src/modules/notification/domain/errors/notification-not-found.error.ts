import { DomainError } from '@shared/kernel/errors/domain-error';

export class NotificationNotFoundError extends DomainError {
  constructor() {
    super('NOTIFICATION_NOT_FOUND', 404, 'Không tìm thấy thông báo');
  }
}
