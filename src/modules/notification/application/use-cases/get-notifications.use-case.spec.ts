import { INotificationRepository } from '../ports/notification-repository.interface';
import { ResolveNotificationActorsService } from '../services/resolve-notification-actors.service';
import { Notification } from '../../domain/notification.entity';
import { GetNotificationsUseCase } from './get-notifications.use-case';

describe('GetNotificationsUseCase', () => {
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let resolveNotificationActorsService: jest.Mocked<ResolveNotificationActorsService>;
  let useCase: GetNotificationsUseCase;

  beforeEach(() => {
    notificationRepository = {
      create: jest.fn(),
      findByProfileId: jest.fn(),
      countUnread: jest.fn(),
      findById: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    };
    resolveNotificationActorsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ResolveNotificationActorsService>;

    useCase = new GetNotificationsUseCase(
      notificationRepository,
      resolveNotificationActorsService,
    );
  });

  it('maps notifications with resolved actor info', async () => {
    const createdAt = new Date();
    const notification = new Notification({
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
    notificationRepository.findByProfileId.mockResolvedValue({
      items: [notification],
      total: 1,
    });
    resolveNotificationActorsService.execute.mockResolvedValue(
      new Map([
        [
          'commenter-1',
          { profileId: 'commenter-1', displayName: 'Alice', avatarUrl: null },
        ],
      ]),
    );

    const result = await useCase.execute({
      profileId: 'owner-1',
      page: 1,
      limit: 20,
    });

    expect(notificationRepository.findByProfileId).toHaveBeenCalledWith(
      'owner-1',
      1,
      20,
    );
    expect(result).toEqual({
      items: [
        {
          id: 'notif-1',
          type: 'NEW_COMMENT',
          actor: {
            profileId: 'commenter-1',
            displayName: 'Alice',
            avatarUrl: null,
          },
          postId: 'post-1',
          commentId: 'comment-1',
          contentPreview: 'hello',
          isRead: false,
          createdAt,
        },
      ],
      total: 1,
    });
  });

  it('falls back to a placeholder actor when profile info is missing', async () => {
    const notification = new Notification({
      id: 'notif-1',
      recipientProfileId: 'owner-1',
      actorProfileId: 'commenter-1',
      type: 'NEW_REPLY',
      postId: 'post-1',
      commentId: 'comment-1',
      contentPreview: 'hi',
      isRead: false,
      createdAt: new Date(),
    });
    notificationRepository.findByProfileId.mockResolvedValue({
      items: [notification],
      total: 1,
    });
    resolveNotificationActorsService.execute.mockResolvedValue(new Map());

    const result = await useCase.execute({
      profileId: 'owner-1',
      page: 1,
      limit: 20,
    });

    expect(result.items[0].actor).toEqual({
      profileId: 'commenter-1',
      displayName: null,
      avatarUrl: null,
    });
  });
});
