import { INotificationRepository } from '../ports/notification-repository.interface';
import { MarkAllNotificationsAsReadUseCase } from './mark-all-notifications-as-read.use-case';

describe('MarkAllNotificationsAsReadUseCase', () => {
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let useCase: MarkAllNotificationsAsReadUseCase;

  beforeEach(() => {
    notificationRepository = {
      create: jest.fn(),
      findByProfileId: jest.fn(),
      countUnread: jest.fn(),
      findById: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    };

    useCase = new MarkAllNotificationsAsReadUseCase(notificationRepository);
  });

  it('marks all notifications as read for the given profile', async () => {
    await useCase.execute({ profileId: 'owner-1' });

    expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith(
      'owner-1',
    );
  });
});
