import { Inject, Injectable } from '@nestjs/common';
import {
  ICreateNotificationUseCase,
  TCreateNotificationInput,
} from '../ports/create-notification-use-case.interface';
import {
  NOTIFICATION_REALTIME_PORT,
  NOTIFICATION_REPOSITORY,
} from '../ports/notification-application.tokens';
import { INotificationRealtimePort } from '../ports/notification-realtime.interface';
import { INotificationRepository } from '../ports/notification-repository.interface';
import { Notification } from '../../domain/notification.entity';

@Injectable()
export class CreateNotificationUseCase implements ICreateNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly _notificationRepository: INotificationRepository,
    @Inject(NOTIFICATION_REALTIME_PORT)
    private readonly _notificationRealtimePort: INotificationRealtimePort,
  ) {}

  async execute(input: TCreateNotificationInput): Promise<Notification> {
    const notification = new Notification({
      id: null,
      recipientProfileId: input.recipientProfileId,
      actorProfileId: input.actorProfileId,
      type: input.type,
      postId: input.postId,
      commentId: input.commentId,
      contentPreview: input.contentPreview,
      isRead: false,
      createdAt: null,
    });

    const created = await this._notificationRepository.create(notification);

    this._notificationRealtimePort.notify(input.recipientProfileId, {
      id: created.id,
      type: created.type,
      actorProfileId: created.actorProfileId,
      postId: created.postId,
      commentId: created.commentId,
      contentPreview: created.contentPreview,
      createdAt: created.createdAt,
    });

    return created;
  }
}
