import { Inject, Injectable } from '@nestjs/common';
import { Address } from '@modules/account/domain/address.entity';
import { Profile } from '@modules/account/domain/profile.entity';
import { AddressNotFoundError } from '@modules/account/domain/errors/address-not-found.error';
import { DuplicateProfileTypeError } from '@modules/account/domain/errors/duplicate-profile-type.error';
import { InvalidProfileAddressInputError } from '@modules/account/domain/errors/invalid-profile-address-input.error';
import { MaxProfileLimitReachedError } from '@modules/account/domain/errors/max-profile-limit-reached.error';
import {
  ADDRESS_REPOSITORY,
  PROFILE_REPOSITORY,
} from '@modules/account/application/ports/account-application.tokens';
import { IAddressRepository } from '@modules/account/application/ports/address/address-repository.interface';
import { IProfileRepository } from '@modules/account/application/ports/profile-repository.interface';
import {
  ICreateProfileUseCase,
  TCreateProfileInput,
} from '@modules/account/application/ports/profile/create-profile-use-case.interface';

const MAX_PROFILE_COUNT = 3;

@Injectable()
export class CreateProfileUseCase implements ICreateProfileUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly _profileRepository: IProfileRepository,
    @Inject(ADDRESS_REPOSITORY)
    private readonly _addressRepository: IAddressRepository,
  ) {}

  async execute(input: TCreateProfileInput): Promise<Profile> {
    const existingProfiles = await this._profileRepository.findAllByAccountId(
      input.accountId,
    );

    if (existingProfiles.length >= MAX_PROFILE_COUNT) {
      throw new MaxProfileLimitReachedError();
    }

    const isDuplicate = existingProfiles.some(
      (profile) => profile.activeProfile === input.profileType,
    );
    if (isDuplicate) {
      throw new DuplicateProfileTypeError();
    }

    if (!!input.addressId === !!input.newAddress) {
      throw new InvalidProfileAddressInputError();
    }

    const profile = await this._profileRepository.create(
      new Profile({
        id: null,
        activeProfile: input.profileType,
        accountId: input.accountId,
        displayName: 'mock display name',
        avatarUrl: 'mock-avatar-url.png',
        addressId: null,
        createdAt: null,
        updatedAt: null,
      }),
    );

    const address = await this._resolveAddress(input, profile);

    profile.changeAddressId(address.id as string);
    return this._profileRepository.update(profile);
  }

  private async _resolveAddress(
    input: TCreateProfileInput,
    profile: Profile,
  ): Promise<Address> {
    if (input.addressId) {
      const address = await this._addressRepository.findById(input.addressId);
      if (!address || address.accountId !== input.accountId) {
        throw new AddressNotFoundError();
      }
      return address;
    }

    const newAddress = input.newAddress as NonNullable<
      TCreateProfileInput['newAddress']
    >;
    return this._addressRepository.create(
      new Address({
        id: null,
        label: newAddress.label,
        province: newAddress.province,
        provinceCode: newAddress.provinceCode,
        ward: newAddress.ward,
        details: newAddress.details,
        accountId: input.accountId,
        profileId: profile.id,
        createdAt: null,
        updatedAt: null,
      }),
    );
  }
}
