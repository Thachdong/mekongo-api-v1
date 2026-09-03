import { Inject, Injectable } from '@nestjs/common';
import { PASSWORD_HASHER } from '@shared/common/hashing/hashing.tokens';
import { IPasswordHasher } from '@shared/common/hashing/password-hasher.interface';
import { AccountNotFoundError } from '../../../domain/errors/account-not-found.error';
import { InvalidCurrentPasswordError } from '../../../domain/errors/invalid-current-password.error';
import {
  IChangeOwnPasswordUseCase,
  TChangeOwnPasswordInput,
} from '../../ports/account/change-own-password-use-case.interface';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import { IChangeAccountPasswordUseCase } from '../../ports/account/change-account-password-use-case.interface';
import {
  ACCOUNT_REPOSITORY,
  CHANGE_ACCOUNT_PASSWORD_USECASE,
} from '../../ports/account-application.tokens';

@Injectable()
export class ChangeOwnPasswordUseCase implements IChangeOwnPasswordUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly _accountRepository: IAccountRepository,
    @Inject(PASSWORD_HASHER)
    private readonly _passwordHasher: IPasswordHasher,
    @Inject(CHANGE_ACCOUNT_PASSWORD_USECASE)
    private readonly _changeAccountPasswordUseCase: IChangeAccountPasswordUseCase,
  ) {}

  async execute(input: TChangeOwnPasswordInput): Promise<void> {
    const account = await this._accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    const isCurrentPasswordValid = await this._passwordHasher.verify(
      input.currentPassword,
      account.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidCurrentPasswordError();
    }

    const passwordHash = await this._passwordHasher.hash(input.newPassword);

    await this._changeAccountPasswordUseCase.execute({
      accountId: input.accountId,
      passwordHash,
    });
  }
}
