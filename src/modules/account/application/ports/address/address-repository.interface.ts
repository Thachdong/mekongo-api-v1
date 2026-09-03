import { Address } from '../../../domain/address.entity';

export interface IAddressRepository {
  create(address: Address): Promise<Address>;
  findAllByAccountId(accountId: string): Promise<Address[]>;
  findById(id: string): Promise<Address | null>;
  delete(id: string): Promise<void>;
}
