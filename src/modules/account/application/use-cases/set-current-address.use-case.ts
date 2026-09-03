import { Inject, Injectable } from '@nestjs/common';
import {
  ACCOUNT_REPOSITORY,
  ADDRESS_REPOSITORY,
} from '../ports/account-application.tokens';
import { IAccountRepository } from '../ports/account-repository.interface';
import { IAddressRepository } from '../ports/address-repository.interface';
import {
  ISetCurrentAddressUseCase,
  TSetCurrentAddressInput,
} from '../ports/set-current-address-use-case.interface';
import { AccountNotFoundError } from '../../domain/errors/account-not-found.error';
import { AddressNotFoundError } from '../../domain/errors/address-not-found.error';

@Injectable()
export class SetCurrentAddressUseCase implements ISetCurrentAddressUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly _addressRepository: IAddressRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly _accountRepository: IAccountRepository,
  ) {}

  async execute(input: TSetCurrentAddressInput): Promise<void> {
    const address = await this._addressRepository.findById(input.addressId);

    if (!address || address.accountId !== input.accountId) {
      throw new AddressNotFoundError();
    }

    const account = await this._accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    account.changeCurrentAddressId(input.addressId);

    await this._accountRepository.update(account);
  }
}
