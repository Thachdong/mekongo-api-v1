import { Chat } from '../../domain/chat.entity';
import { OwnerCannotInitiateChatError } from '../../domain/errors/owner-cannot-initiate-chat.error';
import { IChatRepository } from '../ports/chat-repository.interface';
import { ValidateChatParticipantService } from '../services/validate-chat-participant.service';
import { SendChatMessageUseCase } from './send-chat-message.use-case';

describe('SendChatMessageUseCase', () => {
  let chatRepository: jest.Mocked<IChatRepository>;
  let validateChatParticipantService: jest.Mocked<ValidateChatParticipantService>;
  let useCase: SendChatMessageUseCase;

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

    useCase = new SendChatMessageUseCase(
      chatRepository,
      validateChatParticipantService,
    );
  });

  it('validates participant then persists the message with resolved ownerProfileId', async () => {
    validateChatParticipantService.execute.mockResolvedValue({
      ownerProfileId: 'owner-1',
    });
    const persisted = new Chat({
      id: 'chat-1',
      postId: 'post-id',
      ownerProfileId: 'owner-1',
      buyerProfileId: 'buyer-1',
      senderProfileId: 'buyer-1',
      content: 'hello',
      createdAt: new Date(),
    });
    chatRepository.create.mockResolvedValue(persisted);

    const result = await useCase.execute({
      postId: 'post-id',
      buyerProfileId: 'buyer-1',
      senderProfileId: 'buyer-1',
      content: 'hello',
    });

    expect(validateChatParticipantService.execute).toHaveBeenCalledWith({
      postId: 'post-id',
      buyerProfileId: 'buyer-1',
      requesterProfileId: 'buyer-1',
    });
    expect(chatRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        postId: 'post-id',
        ownerProfileId: 'owner-1',
        buyerProfileId: 'buyer-1',
        senderProfileId: 'buyer-1',
        content: 'hello',
      }),
    );
    expect(result).toBe(persisted);
  });

  it('throws OwnerCannotInitiateChatError when owner sends into a room with no prior message', async () => {
    validateChatParticipantService.execute.mockResolvedValue({
      ownerProfileId: 'owner-1',
    });
    chatRepository.findMessages.mockResolvedValue({ items: [], total: 0 });

    await expect(
      useCase.execute({
        postId: 'post-id',
        buyerProfileId: 'buyer-1',
        senderProfileId: 'owner-1',
        content: 'hello',
      }),
    ).rejects.toThrow(OwnerCannotInitiateChatError);
    expect(chatRepository.create).not.toHaveBeenCalled();
  });

  it('allows owner to reply once the buyer has sent a prior message', async () => {
    validateChatParticipantService.execute.mockResolvedValue({
      ownerProfileId: 'owner-1',
    });
    chatRepository.findMessages.mockResolvedValue({
      items: [expect.any(Chat)],
      total: 1,
    } as any);
    const persisted = new Chat({
      id: 'chat-2',
      postId: 'post-id',
      ownerProfileId: 'owner-1',
      buyerProfileId: 'buyer-1',
      senderProfileId: 'owner-1',
      content: 'reply',
      createdAt: new Date(),
    });
    chatRepository.create.mockResolvedValue(persisted);

    const result = await useCase.execute({
      postId: 'post-id',
      buyerProfileId: 'buyer-1',
      senderProfileId: 'owner-1',
      content: 'reply',
    });

    expect(result).toBe(persisted);
  });

  it('propagates validation errors without persisting', async () => {
    const error = new Error('forbidden');
    validateChatParticipantService.execute.mockRejectedValue(error);

    await expect(
      useCase.execute({
        postId: 'post-id',
        buyerProfileId: 'buyer-1',
        senderProfileId: 'stranger-1',
        content: 'hello',
      }),
    ).rejects.toThrow(error);
    expect(chatRepository.create).not.toHaveBeenCalled();
  });
});
