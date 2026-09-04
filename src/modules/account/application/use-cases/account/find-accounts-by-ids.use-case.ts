import { Inject, Injectable } from '@nestjs/common';
import { Account } from '../../../domain/account.entity';
import { ACCOUNT_REPOSITORY } from '../../ports/account-application.tokens';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import {
  IFindAccountsByIdsUseCase,
  TFindAccountsByIdsInput,
} from '../../ports/account/find-accounts-by-ids-use-case.interface';

@Injectable()
export class FindAccountsByIdsUseCase implements IFindAccountsByIdsUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly _accountRepository: IAccountRepository,
  ) {}

  async execute(input: TFindAccountsByIdsInput): Promise<Account[]> {
    return this._accountRepository.findByIds(input.accountIds);
  }
}
