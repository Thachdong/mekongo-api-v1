import { Address } from '../../domain/address.entity';

export interface IAddressRepository {
  create(address: Address): Promise<Address>;
  findAllByAccountId(accountId: string): Promise<Address[]>;
}
