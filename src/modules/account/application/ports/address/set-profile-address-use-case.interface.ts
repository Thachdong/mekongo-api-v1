export type TSetProfileAddressInput = {
  accountId: string;
  profileId: string;
  addressId: string;
};

export interface ISetProfileAddressUseCase {
  execute(input: TSetProfileAddressInput): Promise<void>;
}
