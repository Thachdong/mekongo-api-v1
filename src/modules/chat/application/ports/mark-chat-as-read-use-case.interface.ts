export type TMarkChatAsReadInput = {
  postId: string;
  buyerProfileId: string;
  requesterProfileId: string;
};

export interface IMarkChatAsReadUseCase {
  execute(input: TMarkChatAsReadInput): Promise<void>;
}
