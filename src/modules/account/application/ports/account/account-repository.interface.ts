import { Account } from '../../../domain/account.entity';

export interface IAccountRepository {
  create(account: Account): Promise<Account>;
  update(account: Account): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByIds(ids: string[]): Promise<Account[]>;
  findByIdentifierHash(identifierHash: string): Promise<Account | null>;
}
