import { INotificationRealtimePort } from '../ports/notification-realtime.interface';
import { INotificationRepository } from '../ports/notification-repository.interface';
import { Notification } from '../../domain/notification.entity';
import { CreateNotificationUseCase } from './create-notification.use-case';

describe('CreateNotificationUseCase', () => {
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let notificationRealtimePort: jest.Mocked<INotificationRealtimePort>;
  let useCase: CreateNotificationUseCase;

  beforeEach(() => {
    notificationRepository = {
      create: jest.fn(),
      findByProfileId: jest.fn(),
      countUnread: jest.fn(),
      findById: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    };
    notificationRealtimePort = {
      notify: jest.fn(),
    };

    useCase = new CreateNotificationUseCase(
      notificationRepository,
      notificationRealtimePort,
    );
  });

  it('persists the notification then pushes it realtime to the recipient', async () => {
    const createdAt = new Date();
    const created = new Notification({
      id: 'notif-1',
      recipientProfileId: 'owner-1',
      actorProfileId: 'commenter-1',
      type: 'NEW_COMMENT',
      postId: 'post-1',
      commentId: 'comment-1',
      contentPreview: 'hello',
      isRead: false,
      createdAt,
    });
    notificationRepository.create.mockResolvedValue(created);

    const result = await useCase.execute({
      recipientProfileId: 'owner-1',
      actorProfileId: 'commenter-1',
      type: 'NEW_COMMENT',
      postId: 'post-1',
      commentId: 'comment-1',
      contentPreview: 'hello',
    });

    expect(notificationRepository.create).toHaveBeenCalled();
    expect(notificationRealtimePort.notify).toHaveBeenCalledWith('owner-1', {
      id: 'notif-1',
      type: 'NEW_COMMENT',
      actorProfileId: 'commenter-1',
      postId: 'post-1',
      commentId: 'comment-1',
      contentPreview: 'hello',
      createdAt,
    });
    expect(result).toBe(created);
  });
});
