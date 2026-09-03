import { Account } from '../../../domain/account.entity';

export type TFindAccountByIdentifierInput = {
  identifier: string;
};

export type TFindAccountByIdentifierOutput = {
  account: Account;
};

export interface IFindAccountByIdentifierUseCase {
  execute(
    input: TFindAccountByIdentifierInput,
  ): Promise<TFindAccountByIdentifierOutput>;
}
