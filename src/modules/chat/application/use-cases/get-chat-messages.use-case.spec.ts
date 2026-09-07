import { Chat } from '../../domain/chat.entity';
import { ChatParticipantForbiddenError } from '../../domain/errors/chat-participant-forbidden.error';
import { IChatRepository } from '../ports/chat-repository.interface';
import { ValidateChatParticipantService } from '../services/validate-chat-participant.service';
import { GetChatMessagesUseCase } from './get-chat-messages.use-case';

describe('GetChatMessagesUseCase', () => {
  let chatRepository: jest.Mocked<IChatRepository>;
  let validateChatParticipantService: jest.Mocked<ValidateChatParticipantService>;
  let useCase: GetChatMessagesUseCase;

  beforeEach(() => {
    chatRepository = {
      create: jest.fn(),
      findRoomsByProfileId: jest.fn(),
      findMessages: jest.fn(),
      upsertReadState: jest.fn(),
      countUnreadRooms: jest.fn(),
    };
    validateChatParticipantService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ValidateChatParticipantService>;

    useCase = new GetChatMessagesUseCase(
      chatRepository,
      validateChatParticipantService,
    );
  });

  it('validates the requester before returning paginated messages', async () => {
    validateChatParticipantService.execute.mockResolvedValue({
      ownerProfileId: 'owner-1',
    });
    const chat = new Chat({
      id: 'chat-1',
      postId: 'post-1',
      ownerProfileId: 'owner-1',
      buyerProfileId: 'buyer-1',
      senderProfileId: 'buyer-1',
      content: 'hi',
      createdAt: new Date(),
    });
    chatRepository.findMessages.mockResolvedValue({
      items: [chat],
      total: 1,
    });

    const result = await useCase.execute({
      postId: 'post-1',
      buyerProfileId: 'buyer-1',
      requesterProfileId: 'buyer-1',
      page: 1,
      limit: 20,
    });

    expect(validateChatParticipantService.execute).toHaveBeenCalledWith({
      postId: 'post-1',
      buyerProfileId: 'buyer-1',
      requesterProfileId: 'buyer-1',
    });
    expect(chatRepository.findMessages).toHaveBeenCalledWith(
      'post-1',
      'buyer-1',
      1,
      20,
    );
    expect(result).toEqual({ items: [chat], total: 1 });
  });

  it('propagates the forbidden error without querying messages', async () => {
    validateChatParticipantService.execute.mockRejectedValue(
      new ChatParticipantForbiddenError(),
    );

    await expect(
      useCase.execute({
        postId: 'post-1',
        buyerProfileId: 'buyer-1',
        requesterProfileId: 'stranger-1',
        page: 1,
        limit: 20,
      }),
    ).rejects.toThrow(ChatParticipantForbiddenError);
    expect(chatRepository.findMessages).not.toHaveBeenCalled();
  });
});
