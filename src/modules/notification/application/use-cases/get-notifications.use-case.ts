import { Inject, Injectable } from '@nestjs/common';
import {
  IGetNotificationsUseCase,
  TGetNotificationsInput,
  TNotificationListItem,
} from '../ports/get-notifications-use-case.interface';
import { NOTIFICATION_REPOSITORY } from '../ports/notification-application.tokens';
import { INotificationRepository } from '../ports/notification-repository.interface';
import { ResolveNotificationActorsService } from '../services/resolve-notification-actors.service';

@Injectable()
export class GetNotificationsUseCase implements IGetNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly _notificationRepository: INotificationRepository,
    private readonly _resolveNotificationActorsService: ResolveNotificationActorsService,
  ) {}

  async execute(
    input: TGetNotificationsInput,
  ): Promise<{ items: TNotificationListItem[]; total: number }> {
    const { items, total } = await this._notificationRepository.findByProfileId(
      input.profileId,
      input.page,
      input.limit,
    );

    const actorByProfileId =
      await this._resolveNotificationActorsService.execute(items);

    return {
      items: items.map((notification) => ({
        id: notification.id as string,
        type: notification.type,
        actor: actorByProfileId.get(notification.actorProfileId) ?? {
          profileId: notification.actorProfileId,
          displayName: null,
          avatarUrl: null,
        },
        postId: notification.postId,
        commentId: notification.commentId,
        contentPreview: notification.contentPreview,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      })),
      total,
    };
  }
}
