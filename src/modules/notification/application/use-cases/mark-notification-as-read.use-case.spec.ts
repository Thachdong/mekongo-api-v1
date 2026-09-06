import { INotificationRepository } from '../ports/notification-repository.interface';
import { Notification } from '../../domain/notification.entity';
import { NotificationNotFoundError } from '../../domain/errors/notification-not-found.error';
import { MarkNotificationAsReadUseCase } from './mark-notification-as-read.use-case';

describe('MarkNotificationAsReadUseCase', () => {
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let useCase: MarkNotificationAsReadUseCase;

  beforeEach(() => {
    notificationRepository = {
      create: jest.fn(),
      findByProfileId: jest.fn(),
      countUnread: jest.fn(),
      findById: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    };

    useCase = new MarkNotificationAsReadUseCase(notificationRepository);
  });

  it('marks the notification as read when it belongs to the requester', async () => {
    const notification = new Notification({
      id: 'notif-1',
      recipientProfileId: 'owner-1',
      actorProfileId: 'commenter-1',
      type: 'NEW_COMMENT',
      postId: 'post-1',
      commentId: 'comment-1',
      contentPreview: 'hello',
      isRead: false,
      createdAt: new Date(),
    });
    notificationRepository.findById.mockResolvedValue(notification);

    await useCase.execute({
      notificationId: 'notif-1',
      requesterProfileId: 'owner-1',
    });

    expect(notification.isRead).toBe(true);
    expect(notificationRepository.markAsRead).toHaveBeenCalledWith(
      notification,
    );
  });

  it('throws NotificationNotFoundError when notification does not exist', async () => {
    notificationRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        notificationId: 'missing',
        requesterProfileId: 'owner-1',
      }),
    ).rejects.toThrow(NotificationNotFoundError);
    expect(notificationRepository.markAsRead).not.toHaveBeenCalled();
  });

  it('throws NotificationNotFoundError when notification belongs to someone else', async () => {
    const notification = new Notification({
      id: 'notif-1',
      recipientProfileId: 'owner-1',
      actorProfileId: 'commenter-1',
      type: 'NEW_COMMENT',
      postId: 'post-1',
      commentId: 'comment-1',
      contentPreview: 'hello',
      isRead: false,
      createdAt: new Date(),
    });
    notificationRepository.findById.mockResolvedValue(notification);

    await expect(
      useCase.execute({
        notificationId: 'notif-1',
        requesterProfileId: 'stranger-1',
      }),
    ).rejects.toThrow(NotificationNotFoundError);
    expect(notificationRepository.markAsRead).not.toHaveBeenCalled();
  });
});
