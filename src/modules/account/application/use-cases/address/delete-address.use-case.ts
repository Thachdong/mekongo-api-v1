import { Inject, Injectable } from '@nestjs/common';
import {
  ADDRESS_REPOSITORY,
  PROFILE_REPOSITORY,
} from '../../ports/account-application.tokens';
import { IAddressRepository } from '../../ports/address/address-repository.interface';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import {
  IDeleteAddressUseCase,
  TDeleteAddressInput,
} from '../../ports/address/delete-address-use-case.interface';
import { AddressAssignedToProfileError } from '../../../domain/errors/address-assigned-to-profile.error';
import { AddressNotFoundError } from '../../../domain/errors/address-not-found.error';

@Injectable()
export class DeleteAddressUseCase implements IDeleteAddressUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly _addressRepository: IAddressRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly _profileRepository: IProfileRepository,
  ) {}

  async execute(input: TDeleteAddressInput): Promise<void> {
    const address = await this._addressRepository.findById(input.addressId);

    if (!address || address.accountId !== input.accountId) {
      throw new AddressNotFoundError();
    }

    const profiles = await this._profileRepository.findAllByAccountId(
      input.accountId,
    );
    const isAssigned = profiles.some(
      (profile) => profile.addressId === input.addressId,
    );

    if (isAssigned) {
      throw new AddressAssignedToProfileError();
    }

    await this._addressRepository.delete(input.addressId);
  }
}
