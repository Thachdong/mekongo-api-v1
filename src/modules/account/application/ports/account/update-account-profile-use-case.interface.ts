export type TUpdateAccountProfileInput = {
  accountId: string;
  profileId: string;
  displayName?: string;
  avatarUrl?: string;
};

export interface IUpdateAccountProfileUseCase {
  execute(input: TUpdateAccountProfileInput): Promise<void>;
}
