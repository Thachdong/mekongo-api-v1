import { Inject, Injectable } from '@nestjs/common';
import { AccountNotFoundError } from '../../../domain/errors/account-not-found.error';
import {
  IActivateAccountUseCase,
  TActivateAccountInput,
} from '../../ports/account/activate-account-use-case.interface';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import { ACCOUNT_REPOSITORY } from '../../ports/account-application.tokens';

@Injectable()
export class ActivateAccountUseCase implements IActivateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly _accountRepository: IAccountRepository,
  ) {}

  async execute(input: TActivateAccountInput): Promise<void> {
    const account = await this._accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    account.activate();

    await this._accountRepository.update(account);
  }
}
