import { Inject, Injectable } from '@nestjs/common';
import {
  ACCOUNT_REPOSITORY,
  PROFILE_REPOSITORY,
} from '../../ports/account-application.tokens';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import {
  ISetActiveProfileUseCase,
  TSetActiveProfileInput,
} from '../../ports/profile/set-active-profile-use-case.interface';
import { AccountNotFoundError } from '../../../domain/errors/account-not-found.error';
import { ProfileNotFoundError } from '../../../domain/errors/profile-not-found.error';

@Injectable()
export class SetActiveProfileUseCase implements ISetActiveProfileUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly _profileRepository: IProfileRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly _accountRepository: IAccountRepository,
  ) {}

  async execute(input: TSetActiveProfileInput): Promise<void> {
    const profile = await this._profileRepository.findById(input.profileId);

    if (!profile || profile.accountId !== input.accountId) {
      throw new ProfileNotFoundError();
    }

    const account = await this._accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    account.changeActiveProfileId(input.profileId);

    await this._accountRepository.update(account);
  }
}
