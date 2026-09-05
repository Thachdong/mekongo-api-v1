import { IChatRepository } from '../ports/chat-repository.interface';
import { ResolveChatParticipantsService } from '../services/resolve-chat-participants.service';
import { GetChatRoomsUseCase } from './get-chat-rooms.use-case';

describe('GetChatRoomsUseCase', () => {
  let chatRepository: jest.Mocked<IChatRepository>;
  let resolveChatParticipantsService: jest.Mocked<ResolveChatParticipantsService>;
  let useCase: GetChatRoomsUseCase;

  beforeEach(() => {
    chatRepository = {
      create: jest.fn(),
      findRoomsByProfileId: jest.fn(),
      findMessages: jest.fn(),
      upsertReadState: jest.fn(),
      countUnreadRooms: jest.fn(),
    };
    resolveChatParticipantsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ResolveChatParticipantsService>;

    useCase = new GetChatRoomsUseCase(
      chatRepository,
      resolveChatParticipantsService,
    );
  });

  it('resolves the counterpart as buyer when requester is the owner', async () => {
    const lastMessageAt = new Date();
    chatRepository.findRoomsByProfileId.mockResolvedValue([
      {
        postId: 'post-1',
        ownerProfileId: 'owner-1',
        buyerProfileId: 'buyer-1',
        lastMessageContent: 'hi',
        lastMessageAt,
      },
    ]);
    resolveChatParticipantsService.execute.mockResolvedValue(
      new Map([
        [
          'buyer-1',
          { profileId: 'buyer-1', displayName: 'Buyer', avatarUrl: null },
        ],
      ]),
    );

    const result = await useCase.execute({ profileId: 'owner-1' });

    expect(resolveChatParticipantsService.execute).toHaveBeenCalledWith([
      'buyer-1',
    ]);
    expect(result).toEqual([
      {
        postId: 'post-1',
        counterpart: {
          profileId: 'buyer-1',
          displayName: 'Buyer',
          avatarUrl: null,
        },
        lastMessageContent: 'hi',
        lastMessageAt,
      },
    ]);
  });

  it('resolves the counterpart as owner when requester is the buyer', async () => {
    const lastMessageAt = new Date();
    chatRepository.findRoomsByProfileId.mockResolvedValue([
      {
        postId: 'post-1',
        ownerProfileId: 'owner-1',
        buyerProfileId: 'buyer-1',
        lastMessageContent: 'hi',
        lastMessageAt,
      },
    ]);
    resolveChatParticipantsService.execute.mockResolvedValue(
      new Map([
        [
          'owner-1',
          { profileId: 'owner-1', displayName: 'Owner', avatarUrl: null },
        ],
      ]),
    );

    const result = await useCase.execute({ profileId: 'buyer-1' });

    expect(resolveChatParticipantsService.execute).toHaveBeenCalledWith([
      'owner-1',
    ]);
    expect(result[0].counterpart.profileId).toBe('owner-1');
  });

  it('falls back to a placeholder when counterpart profile info is missing', async () => {
    chatRepository.findRoomsByProfileId.mockResolvedValue([
      {
        postId: 'post-1',
        ownerProfileId: 'owner-1',
        buyerProfileId: 'buyer-1',
        lastMessageContent: 'hi',
        lastMessageAt: new Date(),
      },
    ]);
    resolveChatParticipantsService.execute.mockResolvedValue(new Map());

    const result = await useCase.execute({ profileId: 'owner-1' });

    expect(result[0].counterpart).toEqual({
      profileId: 'buyer-1',
      displayName: null,
      avatarUrl: null,
    });
  });
});
