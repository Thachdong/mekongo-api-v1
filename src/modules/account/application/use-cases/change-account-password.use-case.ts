import { Inject, Injectable } from '@nestjs/common';
import { AccountNotFoundError } from '../../domain/errors/account-not-found.error';
import {
  IChangeAccountPasswordUseCase,
  TChangeAccountPasswordInput,
} from '../ports/change-account-password-use-case.interface';
import { IAccountRepository } from '../ports/account-repository.interface';
import { ACCOUNT_REPOSITORY } from '../ports/account-application.tokens';

@Injectable()
export class ChangeAccountPasswordUseCase implements IChangeAccountPasswordUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly _accountRepository: IAccountRepository,
  ) {}

  async execute(input: TChangeAccountPasswordInput): Promise<void> {
    const account = await this._accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    account.changePaswordHash(input.passwordHash);

    await this._accountRepository.update(account);
  }
}
