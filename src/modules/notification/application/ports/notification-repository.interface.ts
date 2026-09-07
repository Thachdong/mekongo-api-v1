import { Notification } from '../../domain/notification.entity';

export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findByProfileId(
    profileId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Notification[]; total: number }>;
  countUnread(profileId: string): Promise<number>;
  findById(id: string): Promise<Notification | null>;
  markAsRead(notification: Notification): Promise<void>;
  markAllAsRead(profileId: string): Promise<void>;
}
