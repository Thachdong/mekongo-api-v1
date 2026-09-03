export type TDeleteAddressInput = {
  accountId: string;
  addressId: string;
};

export interface IDeleteAddressUseCase {
  execute(input: TDeleteAddressInput): Promise<void>;
}
