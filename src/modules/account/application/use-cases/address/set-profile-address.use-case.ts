import { Inject, Injectable } from '@nestjs/common';
import {
  ADDRESS_REPOSITORY,
  PROFILE_REPOSITORY,
} from '../../ports/account-application.tokens';
import { IAddressRepository } from '../../ports/address/address-repository.interface';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import {
  ISetProfileAddressUseCase,
  TSetProfileAddressInput,
} from '../../ports/address/set-profile-address-use-case.interface';
import { AddressNotFoundError } from '../../../domain/errors/address-not-found.error';
import { ProfileNotFoundError } from '../../../domain/errors/profile-not-found.error';

@Injectable()
export class SetProfileAddressUseCase implements ISetProfileAddressUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly _profileRepository: IProfileRepository,
    @Inject(ADDRESS_REPOSITORY)
    private readonly _addressRepository: IAddressRepository,
  ) {}

  async execute(input: TSetProfileAddressInput): Promise<void> {
    const profile = await this._profileRepository.findById(input.profileId);

    if (!profile || profile.accountId !== input.accountId) {
      throw new ProfileNotFoundError();
    }

    const address = await this._addressRepository.findById(input.addressId);

    if (!address || address.accountId !== input.accountId) {
      throw new AddressNotFoundError();
    }

    profile.changeAddressId(input.addressId);

    await this._profileRepository.update(profile);
  }
}
