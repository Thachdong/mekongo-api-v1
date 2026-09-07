import { Inject, Injectable } from '@nestjs/common';
import {
  IGetUnreadChatCountUseCase,
  TGetUnreadChatCountInput,
  TUnreadChatCount,
} from '../ports/get-unread-chat-count-use-case.interface';
import { CHAT_REPOSITORY } from '../ports/chat-application.tokens';
import { IChatRepository } from '../ports/chat-repository.interface';

@Injectable()
export class GetUnreadChatCountUseCase implements IGetUnreadChatCountUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly _chatRepository: IChatRepository,
  ) {}

  async execute(input: TGetUnreadChatCountInput): Promise<TUnreadChatCount> {
    const unreadRooms = await this._chatRepository.countUnreadRooms(
      input.profileId,
    );

    return { unreadRooms };
  }
}
