import { Inject, Injectable } from '@nestjs/common';
import {
  IMarkChatAsReadUseCase,
  TMarkChatAsReadInput,
} from '../ports/mark-chat-as-read-use-case.interface';
import { CHAT_REPOSITORY } from '../ports/chat-application.tokens';
import { IChatRepository } from '../ports/chat-repository.interface';
import { ValidateChatParticipantService } from '../services/validate-chat-participant.service';

@Injectable()
export class MarkChatAsReadUseCase implements IMarkChatAsReadUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly _chatRepository: IChatRepository,
    private readonly _validateChatParticipantService: ValidateChatParticipantService,
  ) {}

  async execute(input: TMarkChatAsReadInput): Promise<void> {
    await this._validateChatParticipantService.execute({
      postId: input.postId,
      buyerProfileId: input.buyerProfileId,
      requesterProfileId: input.requesterProfileId,
    });

    await this._chatRepository.upsertReadState(
      input.requesterProfileId,
      input.postId,
      input.buyerProfileId,
      new Date(),
    );
  }
}
