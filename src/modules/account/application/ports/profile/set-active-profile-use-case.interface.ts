export type TSetActiveProfileInput = {
  accountId: string;
  profileId: string;
};

export interface ISetActiveProfileUseCase {
  execute(input: TSetActiveProfileInput): Promise<void>;
}
