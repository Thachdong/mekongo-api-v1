import { Inject, Injectable } from '@nestjs/common';
import { Address } from '../../domain/address.entity';
import { ADDRESS_REPOSITORY } from '../ports/account-application.tokens';
import { IAddressRepository } from '../ports/address-repository.interface';
import {
  IGetAccountAddressesUseCase,
  TGetAccountAddressesInput,
} from '../ports/get-account-addresses-use-case.interface';

@Injectable()
export class GetAccountAddressesUseCase implements IGetAccountAddressesUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly _addressRepository: IAddressRepository,
  ) {}

  async execute(input: TGetAccountAddressesInput): Promise<Address[]> {
    return this._addressRepository.findAllByAccountId(input.accountId);
  }
}
