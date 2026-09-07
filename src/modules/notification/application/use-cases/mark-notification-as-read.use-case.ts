import { Inject, Injectable } from '@nestjs/common';
import {
  IMarkNotificationAsReadUseCase,
  TMarkNotificationAsReadInput,
} from '../ports/mark-notification-as-read-use-case.interface';
import { NOTIFICATION_REPOSITORY } from '../ports/notification-application.tokens';
import { INotificationRepository } from '../ports/notification-repository.interface';
import { NotificationNotFoundError } from '../../domain/errors/notification-not-found.error';

@Injectable()
export class MarkNotificationAsReadUseCase implements IMarkNotificationAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly _notificationRepository: INotificationRepository,
  ) {}

  async execute(input: TMarkNotificationAsReadInput): Promise<void> {
    const notification = await this._notificationRepository.findById(
      input.notificationId,
    );

    if (
      !notification ||
      notification.recipientProfileId !== input.requesterProfileId
    ) {
      throw new NotificationNotFoundError();
    }

    notification.markAsRead();
    await this._notificationRepository.markAsRead(notification);
  }
}
