import {
  Notification,
  TNotificationType,
} from '../../../domain/notification.entity';
import { NotificationTypeOrmEntity } from '../entities/notification.typeorm-entity';

export class NotificationMapper {
  static toDomain(entity: NotificationTypeOrmEntity): Notification {
    return new Notification({
      id: entity.id,
      recipientProfileId: entity.recipientProfileId,
      actorProfileId: entity.actorProfileId,
      type: entity.type as TNotificationType,
      postId: entity.postId,
      commentId: entity.commentId,
      contentPreview: entity.contentPreview,
      isRead: entity.isRead,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(notification: Notification): NotificationTypeOrmEntity {
    const entity = new NotificationTypeOrmEntity();
    if (notification.id) {
      entity.id = notification.id;
    }
    entity.recipientProfileId = notification.recipientProfileId;
    entity.actorProfileId = notification.actorProfileId;
    entity.type = notification.type;
    entity.postId = notification.postId;
    entity.commentId = notification.commentId;
    entity.contentPreview = notification.contentPreview;
    entity.isRead = notification.isRead;
    return entity;
  }
}
