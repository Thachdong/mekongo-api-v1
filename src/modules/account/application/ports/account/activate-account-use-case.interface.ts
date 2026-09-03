export type TActivateAccountInput = {
  accountId: string;
};

export interface IActivateAccountUseCase {
  execute(input: TActivateAccountInput): Promise<void>;
}
