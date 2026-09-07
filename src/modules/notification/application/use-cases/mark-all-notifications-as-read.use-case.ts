import { Inject, Injectable } from '@nestjs/common';
import {
  IMarkAllNotificationsAsReadUseCase,
  TMarkAllNotificationsAsReadInput,
} from '../ports/mark-all-notifications-as-read-use-case.interface';
import { NOTIFICATION_REPOSITORY } from '../ports/notification-application.tokens';
import { INotificationRepository } from '../ports/notification-repository.interface';

@Injectable()
export class MarkAllNotificationsAsReadUseCase implements IMarkAllNotificationsAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly _notificationRepository: INotificationRepository,
  ) {}

  async execute(input: TMarkAllNotificationsAsReadInput): Promise<void> {
    await this._notificationRepository.markAllAsRead(input.profileId);
  }
}
