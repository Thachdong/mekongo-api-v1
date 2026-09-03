import { Account } from '../../../domain/account.entity';

export type TFindAccountByIdInput = {
  accountId: string;
};

export interface IFindAccountByIdUseCase {
  execute(input: TFindAccountByIdInput): Promise<Account>;
}
