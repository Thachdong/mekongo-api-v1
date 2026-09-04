import { Account } from '../../../domain/account.entity';

export type TFindAccountsByIdsInput = {
  accountIds: string[];
};

export interface IFindAccountsByIdsUseCase {
  execute(input: TFindAccountsByIdsInput): Promise<Account[]>;
}
