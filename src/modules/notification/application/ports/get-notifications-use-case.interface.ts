import { TNotificationType } from '../../domain/notification.entity';

export type TGetNotificationsInput = {
  profileId: string;
  page: number;
  limit: number;
};

export type TNotificationActor = {
  profileId: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type TNotificationListItem = {
  id: string;
  type: TNotificationType;
  actor: TNotificationActor;
  postId: string;
  commentId: string;
  contentPreview: string;
  isRead: boolean;
  createdAt: Date | null;
};

export interface IGetNotificationsUseCase {
  execute(
    input: TGetNotificationsInput,
  ): Promise<{ items: TNotificationListItem[]; total: number }>;
}
