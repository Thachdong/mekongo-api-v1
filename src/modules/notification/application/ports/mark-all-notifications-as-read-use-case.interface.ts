export type TMarkAllNotificationsAsReadInput = {
  profileId: string;
};

export interface IMarkAllNotificationsAsReadUseCase {
  execute(input: TMarkAllNotificationsAsReadInput): Promise<void>;
}
