import { Chat } from '../../domain/chat.entity';

export type TSendChatMessageInput = {
  postId: string;
  buyerProfileId: string;
  senderProfileId: string;
  content: string;
};

export interface ISendChatMessageUseCase {
  execute(input: TSendChatMessageInput): Promise<Chat>;
}
