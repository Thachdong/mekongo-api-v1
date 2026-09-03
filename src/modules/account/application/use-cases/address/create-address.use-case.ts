import { Inject, Injectable } from '@nestjs/common';
import { Address } from '../../../domain/address.entity';
import { ADDRESS_REPOSITORY } from '../../ports/account-application.tokens';
import { IAddressRepository } from '../../ports/address/address-repository.interface';
import {
  ICreateAddressUseCase,
  TCreateAddressInput,
} from '../../ports/address/create-address-use-case.interface';

@Injectable()
export class CreateAddressUseCase implements ICreateAddressUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly _addressRepository: IAddressRepository,
  ) {}

  async execute(input: TCreateAddressInput): Promise<Address> {
    return this._addressRepository.create(
      new Address({
        id: null,
        label: input.label,
        province: input.province,
        provinceCode: input.provinceCode,
        ward: input.ward,
        details: input.details,
        accountId: input.accountId,
        createdAt: null,
        updatedAt: null,
      }),
    );
  }
}
