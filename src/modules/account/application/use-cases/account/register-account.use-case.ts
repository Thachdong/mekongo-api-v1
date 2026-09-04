import { Inject, Injectable } from '@nestjs/common';
import { Account } from '../../../domain/account.entity';
import { Address } from '../../../domain/address.entity';
import { Profile } from '../../../domain/profile.entity';
import {
  ACCOUNT_REPOSITORY,
  ADDRESS_REPOSITORY,
  PROFILE_REPOSITORY,
  TRANSACTION_MANAGER,
} from '../../ports/account-application.tokens';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import { IAddressRepository } from '../../ports/address/address-repository.interface';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import {
  IRegisterAccountUseCase,
  TRegisterAccountInput,
  TRegisterAccountOutput,
} from '../../ports/account/register-account-use-case.interface';
import { ITransactionManager } from '../../ports/transaction-manager.interface';

@Injectable()
export class RegisterAccountUseCase implements IRegisterAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly _accountRepository: IAccountRepository,
    @Inject(ADDRESS_REPOSITORY)
    private readonly _addressRepository: IAddressRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly _profileRepository: IProfileRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly _transactionManager: ITransactionManager,
  ) {}

  async execute(input: TRegisterAccountInput): Promise<TRegisterAccountOutput> {
    return this._transactionManager.runInTransaction(async () => {
      const account = await this._accountRepository.create(
        new Account({
          id: null,
          loginType: input.loginType,
          identifierHash: input.identifierHash,
          passwordHash: input.passwordHash,
          status: 'PENDING_FOR_VERIFICATION',
          blockUntil: null,
          displayName: input.displayName,
          avatarUrl: input.avatarUrl,
          currentAddressId: null,
          activeProfileId: null,
          createdAt: null,
          updatedAt: null,
        }),
      );

      const address = await this._addressRepository.create(
        new Address({
          id: null,
          label: input.address.label,
          province: input.address.province,
          provinceCode: input.address.provinceCode,
          ward: input.address.ward,
          details: input.address.details,
          accountId: account.id as string,
          createdAt: null,
          updatedAt: null,
        }),
      );

      const profile = await this._profileRepository.create(
        new Profile({
          id: null,
          activeProfile: input.profileType,
          accountId: account.id as string,
          displayName: input.displayName,
          avatarUrl: input.avatarUrl,
          createdAt: null,
          updatedAt: null,
        }),
      );

      account.changeCurrentAddressId(address.id as string);
      account.changeActiveProfileId(profile.id as string);

      const updatedAccount = await this._accountRepository.update(account);

      return { account: updatedAccount, address, profile };
    });
  }
}
