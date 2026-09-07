import { INotificationRepository } from '../ports/notification-repository.interface';
import { GetUnreadNotificationCountUseCase } from './get-unread-notification-count.use-case';

describe('GetUnreadNotificationCountUseCase', () => {
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let useCase: GetUnreadNotificationCountUseCase;

  beforeEach(() => {
    notificationRepository = {
      create: jest.fn(),
      findByProfileId: jest.fn(),
      countUnread: jest.fn(),
      findById: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    };

    useCase = new GetUnreadNotificationCountUseCase(notificationRepository);
  });

  it('returns the unread count for the given profile', async () => {
    notificationRepository.countUnread.mockResolvedValue(4);

    const result = await useCase.execute({ profileId: 'owner-1' });

    expect(notificationRepository.countUnread).toHaveBeenCalledWith('owner-1');
    expect(result).toEqual({ unreadCount: 4 });
  });
});
