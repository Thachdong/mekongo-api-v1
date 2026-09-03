import { Inject, Injectable } from '@nestjs/common';
import { Account } from '../../../domain/account.entity';
import { AccountNotFoundError } from '../../../domain/errors/account-not-found.error';
import { ACCOUNT_REPOSITORY } from '../../ports/account-application.tokens';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import {
  IFindAccountByIdUseCase,
  TFindAccountByIdInput,
} from '../../ports/account/find-account-by-id-use-case.interface';

@Injectable()
export class FindAccountByIdUseCase implements IFindAccountByIdUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly _accountRepository: IAccountRepository,
  ) {}

  async execute(input: TFindAccountByIdInput): Promise<Account> {
    const account = await this._accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    return account;
  }
}
