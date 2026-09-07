import { Inject, Injectable } from '@nestjs/common';
import {
  IGetChatRoomsUseCase,
  TChatRoomListItem,
  TGetChatRoomsInput,
} from '../ports/get-chat-rooms-use-case.interface';
import { CHAT_REPOSITORY } from '../ports/chat-application.tokens';
import { IChatRepository } from '../ports/chat-repository.interface';
import { ResolveChatParticipantsService } from '../services/resolve-chat-participants.service';

@Injectable()
export class GetChatRoomsUseCase implements IGetChatRoomsUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly _chatRepository: IChatRepository,
    private readonly _resolveChatParticipantsService: ResolveChatParticipantsService,
  ) {}

  async execute(input: TGetChatRoomsInput): Promise<TChatRoomListItem[]> {
    const rooms = await this._chatRepository.findRoomsByProfileId(
      input.profileId,
    );

    const counterpartIds = rooms.map((room) =>
      room.ownerProfileId === input.profileId
        ? room.buyerProfileId
        : room.ownerProfileId,
    );
    const participantByProfileId =
      await this._resolveChatParticipantsService.execute(counterpartIds);

    return rooms.map((room) => {
      const counterpartId =
        room.ownerProfileId === input.profileId
          ? room.buyerProfileId
          : room.ownerProfileId;

      return {
        postId: room.postId,
        counterpart: participantByProfileId.get(counterpartId) ?? {
          profileId: counterpartId,
          displayName: null,
          avatarUrl: null,
        },
        lastMessageContent: room.lastMessageContent,
        lastMessageAt: room.lastMessageAt,
      };
    });
  }
}
