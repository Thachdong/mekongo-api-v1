export type TSetCurrentAddressInput = {
  accountId: string;
  addressId: string;
};

export interface ISetCurrentAddressUseCase {
  execute(input: TSetCurrentAddressInput): Promise<void>;
}
