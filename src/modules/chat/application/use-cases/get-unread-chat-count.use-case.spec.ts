import { IChatRepository } from '../ports/chat-repository.interface';
import { GetUnreadChatCountUseCase } from './get-unread-chat-count.use-case';

describe('GetUnreadChatCountUseCase', () => {
  let chatRepository: jest.Mocked<IChatRepository>;
  let useCase: GetUnreadChatCountUseCase;

  beforeEach(() => {
    chatRepository = {
      create: jest.fn(),
      findRoomsByProfileId: jest.fn(),
      findMessages: jest.fn(),
      upsertReadState: jest.fn(),
      countUnreadRooms: jest.fn(),
    };

    useCase = new GetUnreadChatCountUseCase(chatRepository);
  });

  it('returns the unread room count for the given profile', async () => {
    chatRepository.countUnreadRooms.mockResolvedValue(3);

    const result = await useCase.execute({ profileId: 'profile-1' });

    expect(chatRepository.countUnreadRooms).toHaveBeenCalledWith('profile-1');
    expect(result).toEqual({ unreadRooms: 3 });
  });
});
