import { Inject, Injectable } from '@nestjs/common';
import { IDENTIFIER_HASHER } from '@shared/common/hashing/hashing.tokens';
import { IKeyedHasher } from '@shared/common/hashing/keyed-hasher.interface';
import { AccountNotFoundError } from '../../domain/errors/account-not-found.error';
import {
  IFindAccountByIdentifierUseCase,
  TFindAccountByIdentifierInput,
  TFindAccountByIdentifierOutput,
} from '../ports/find-account-by-identifier-use-case.interface';
import { IAccountRepository } from '../ports/account-repository.interface';
import { ACCOUNT_REPOSITORY } from '../ports/account-application.tokens';

@Injectable()
export class FindAccountByIdentifierUseCase implements IFindAccountByIdentifierUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly _accountRepository: IAccountRepository,
    @Inject(IDENTIFIER_HASHER)
    private readonly _identifierHasher: IKeyedHasher,
  ) {}

  async execute(
    input: TFindAccountByIdentifierInput,
  ): Promise<TFindAccountByIdentifierOutput> {
    const identifierHash = this._identifierHasher.hash(input.identifier);

    const account =
      await this._accountRepository.findByIdentifierHash(identifierHash);

    if (!account) {
      throw new AccountNotFoundError();
    }

    return { account };
  }
}
