export type TMarkNotificationAsReadInput = {
  notificationId: string;
  requesterProfileId: string;
};

export interface IMarkNotificationAsReadUseCase {
  execute(input: TMarkNotificationAsReadInput): Promise<void>;
}
