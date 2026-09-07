import { IChatRepository } from '../ports/chat-repository.interface';
import { ValidateChatParticipantService } from '../services/validate-chat-participant.service';
import { MarkChatAsReadUseCase } from './mark-chat-as-read.use-case';

describe('MarkChatAsReadUseCase', () => {
  let chatRepository: jest.Mocked<IChatRepository>;
  let validateChatParticipantService: jest.Mocked<ValidateChatParticipantService>;
  let useCase: MarkChatAsReadUseCase;

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

    useCase = new MarkChatAsReadUseCase(
      chatRepository,
      validateChatParticipantService,
    );
  });

  it('validates participant then upserts read state for the requester', async () => {
    validateChatParticipantService.execute.mockResolvedValue({
      ownerProfileId: 'owner-1',
    });

    await useCase.execute({
      postId: 'post-1',
      buyerProfileId: 'buyer-1',
      requesterProfileId: 'buyer-1',
    });

    expect(validateChatParticipantService.execute).toHaveBeenCalledWith({
      postId: 'post-1',
      buyerProfileId: 'buyer-1',
      requesterProfileId: 'buyer-1',
    });
    expect(chatRepository.upsertReadState).toHaveBeenCalledWith(
      'buyer-1',
      'post-1',
      'buyer-1',
      expect.any(Date),
    );
  });

  it('propagates the error when requester is not a participant', async () => {
    const error = new Error('forbidden');
    validateChatParticipantService.execute.mockRejectedValue(error);

    await expect(
      useCase.execute({
        postId: 'post-1',
        buyerProfileId: 'buyer-1',
        requesterProfileId: 'stranger-1',
      }),
    ).rejects.toThrow(error);
    expect(chatRepository.upsertReadState).not.toHaveBeenCalled();
  });
});
