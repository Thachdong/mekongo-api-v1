import { Inject, Injectable } from '@nestjs/common';
import {
  IGetChatMessagesUseCase,
  TGetChatMessagesInput,
  TGetChatMessagesOutput,
} from '../ports/get-chat-messages-use-case.interface';
import { CHAT_REPOSITORY } from '../ports/chat-application.tokens';
import { IChatRepository } from '../ports/chat-repository.interface';
import { ValidateChatParticipantService } from '../services/validate-chat-participant.service';

@Injectable()
export class GetChatMessagesUseCase implements IGetChatMessagesUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly _chatRepository: IChatRepository,
    private readonly _validateChatParticipantService: ValidateChatParticipantService,
  ) {}

  async execute(input: TGetChatMessagesInput): Promise<TGetChatMessagesOutput> {
    await this._validateChatParticipantService.execute({
      postId: input.postId,
      buyerProfileId: input.buyerProfileId,
      requesterProfileId: input.requesterProfileId,
    });

    return this._chatRepository.findMessages(
      input.postId,
      input.buyerProfileId,
      input.page,
      input.limit,
    );
  }
}
