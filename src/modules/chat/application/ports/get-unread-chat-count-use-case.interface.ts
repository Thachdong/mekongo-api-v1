export type TGetUnreadChatCountInput = {
  profileId: string;
};

export type TUnreadChatCount = {
  unreadRooms: number;
};

export interface IGetUnreadChatCountUseCase {
  execute(input: TGetUnreadChatCountInput): Promise<TUnreadChatCount>;
}
