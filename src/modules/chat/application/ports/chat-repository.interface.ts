import { Chat } from '../../domain/chat.entity';

export type TChatRoomSummary = {
  postId: string;
  ownerProfileId: string;
  buyerProfileId: string;
  lastMessageContent: string;
  lastMessageAt: Date;
};

export interface IChatRepository {
  create(chat: Chat): Promise<Chat>;
  findRoomsByProfileId(profileId: string): Promise<TChatRoomSummary[]>;
  findMessages(
    postId: string,
    buyerProfileId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Chat[]; total: number }>;
}
