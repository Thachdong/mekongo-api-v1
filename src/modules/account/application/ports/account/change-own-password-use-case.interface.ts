export type TChangeOwnPasswordInput = {
  accountId: string;
  currentPassword: string;
  newPassword: string;
};

export interface IChangeOwnPasswordUseCase {
  execute(input: TChangeOwnPasswordInput): Promise<void>;
}
