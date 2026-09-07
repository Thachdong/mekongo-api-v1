import { Inject, Injectable } from '@nestjs/common';
import { Chat } from '../../domain/chat.entity';
import { OwnerCannotInitiateChatError } from '../../domain/errors/owner-cannot-initiate-chat.error';
import {
  ISendChatMessageUseCase,
  TSendChatMessageInput,
} from '../ports/send-chat-message-use-case.interface';
import { CHAT_REPOSITORY } from '../ports/chat-application.tokens';
import { IChatRepository } from '../ports/chat-repository.interface';
import { ValidateChatParticipantService } from '../services/validate-chat-participant.service';

@Injectable()
export class SendChatMessageUseCase implements ISendChatMessageUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly _chatRepository: IChatRepository,
    private readonly _validateChatParticipantService: ValidateChatParticipantService,
  ) {}

  async execute(input: TSendChatMessageInput): Promise<Chat> {
    const { ownerProfileId } =
      await this._validateChatParticipantService.execute({
        postId: input.postId,
        buyerProfileId: input.buyerProfileId,
        requesterProfileId: input.senderProfileId,
      });

    if (input.senderProfileId === ownerProfileId) {
      const { total } = await this._chatRepository.findMessages(
        input.postId,
        input.buyerProfileId,
        1,
        1,
      );

      if (total === 0) {
        throw new OwnerCannotInitiateChatError();
      }
    }

    const chat = new Chat({
      id: null,
      postId: input.postId,
      ownerProfileId,
      buyerProfileId: input.buyerProfileId,
      senderProfileId: input.senderProfileId,
      content: input.content,
      createdAt: null,
    });

    return this._chatRepository.create(chat);
  }
}
