export type TChatParticipant = {
  profileId: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type TChatRoomListItem = {
  postId: string;
  counterpart: TChatParticipant;
  lastMessageContent: string;
  lastMessageAt: Date;
};

export type TGetChatRoomsInput = {
  profileId: string;
};

export interface IGetChatRoomsUseCase {
  execute(input: TGetChatRoomsInput): Promise<TChatRoomListItem[]>;
}
