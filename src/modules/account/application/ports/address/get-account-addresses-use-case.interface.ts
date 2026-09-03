import { Address } from '../../../domain/address.entity';

export type TGetAccountAddressesInput = {
  accountId: string;
};

export interface IGetAccountAddressesUseCase {
  execute(input: TGetAccountAddressesInput): Promise<Address[]>;
}
