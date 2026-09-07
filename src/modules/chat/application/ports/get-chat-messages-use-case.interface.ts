import { Chat } from '../../domain/chat.entity';

export type TGetChatMessagesInput = {
  postId: string;
  buyerProfileId: string;
  requesterProfileId: string;
  page: number;
  limit: number;
};

export type TGetChatMessagesOutput = {
  items: Chat[];
  total: number;
};

export interface IGetChatMessagesUseCase {
  execute(input: TGetChatMessagesInput): Promise<TGetChatMessagesOutput>;
}
