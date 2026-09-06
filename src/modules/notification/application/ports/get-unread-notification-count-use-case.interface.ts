export type TGetUnreadNotificationCountInput = {
  profileId: string;
};

export interface IGetUnreadNotificationCountUseCase {
  execute(
    input: TGetUnreadNotificationCountInput,
  ): Promise<{ unreadCount: number }>;
}
