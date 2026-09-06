import {
  Notification,
  TNotificationType,
} from '../../domain/notification.entity';

export type TCreateNotificationInput = {
  recipientProfileId: string;
  actorProfileId: string;
  type: TNotificationType;
  postId: string;
  commentId: string;
  contentPreview: string;
};

export interface ICreateNotificationUseCase {
  execute(input: TCreateNotificationInput): Promise<Notification>;
}
