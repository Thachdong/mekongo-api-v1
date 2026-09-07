import { Inject, Injectable } from '@nestjs/common';
import {
  IGetUnreadNotificationCountUseCase,
  TGetUnreadNotificationCountInput,
} from '../ports/get-unread-notification-count-use-case.interface';
import { NOTIFICATION_REPOSITORY } from '../ports/notification-application.tokens';
import { INotificationRepository } from '../ports/notification-repository.interface';

@Injectable()
export class GetUnreadNotificationCountUseCase implements IGetUnreadNotificationCountUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly _notificationRepository: INotificationRepository,
  ) {}

  async execute(
    input: TGetUnreadNotificationCountInput,
  ): Promise<{ unreadCount: number }> {
    const unreadCount = await this._notificationRepository.countUnread(
      input.profileId,
    );

    return { unreadCount };
  }
}
