import { Address } from '../../../domain/address.entity';
import { Profile } from '../../../domain/profile.entity';
import { AddressNotFoundError } from '../../../domain/errors/address-not-found.error';
import { DuplicateProfileTypeError } from '../../../domain/errors/duplicate-profile-type.error';
import { InvalidProfileAddressInputError } from '../../../domain/errors/invalid-profile-address-input.error';
import { MaxProfileLimitReachedError } from '../../../domain/errors/max-profile-limit-reached.error';
import { IAddressRepository } from '../../ports/address/address-repository.interface';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import { CreateProfileUseCase } from './create-profile.use-case';

function buildProfile(
  overrides: Partial<ConstructorParameters<typeof Profile>[0]> = {},
) {
  return new Profile({
    id: 'profile-1',
    activeProfile: 'INDIVIDUAL',
    accountId: 'account-1',
    displayName: 'mock display name',
    avatarUrl: 'mock-avatar-url.png',
    addressId: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

function buildAddress(
  overrides: Partial<ConstructorParameters<typeof Address>[0]> = {},
) {
  return new Address({
    id: 'address-1',
    label: 'Home',
    province: 'HCM',
    provinceCode: 79,
    ward: 'Ward 1',
    details: '123 Street',
    accountId: 'account-1',
    profileId: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

describe('CreateProfileUseCase', () => {
  let profileRepository: jest.Mocked<IProfileRepository>;
  let addressRepository: jest.Mocked<IAddressRepository>;
  let useCase: CreateProfileUseCase;

  beforeEach(() => {
    profileRepository = {
      create: jest.fn((profile: Profile) =>
        Promise.resolve(
          new Profile({
            id: 'profile-1',
            activeProfile: profile.activeProfile,
            accountId: profile.accountId,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            addressId: profile.addressId,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }),
        ),
      ),
      update: jest.fn((profile: Profile) => Promise.resolve(profile)),
      findAllByAccountId: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      findByIds: jest.fn(),
    };
    addressRepository = {
      create: jest.fn((address: Address) =>
        Promise.resolve(
          new Address({
            id: 'new-address-1',
            label: address.label,
            province: address.province,
            provinceCode: address.provinceCode,
            ward: address.ward,
            details: address.details,
            accountId: address.accountId,
            profileId: address.profileId,
            createdAt: address.createdAt,
            updatedAt: address.updatedAt,
          }),
        ),
      ),
      findAllByAccountId: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateProfileUseCase(profileRepository, addressRepository);
  });

  it('throws MaxProfileLimitReachedError when account already has 3 profiles', async () => {
    profileRepository.findAllByAccountId.mockResolvedValue([
      buildProfile(),
      buildProfile(),
      buildProfile(),
    ]);

    await expect(
      useCase.execute({
        accountId: 'account-1',
        profileType: 'INDIVIDUAL',
        addressId: 'address-1',
      }),
    ).rejects.toThrow(MaxProfileLimitReachedError);
  });

  it('throws DuplicateProfileTypeError when profileType already exists', async () => {
    profileRepository.findAllByAccountId.mockResolvedValue([
      buildProfile({ activeProfile: 'DISTRIBUTOR' }),
    ]);

    await expect(
      useCase.execute({
        accountId: 'account-1',
        profileType: 'DISTRIBUTOR',
        addressId: 'address-1',
      }),
    ).rejects.toThrow(DuplicateProfileTypeError);
  });

  it('throws InvalidProfileAddressInputError when neither addressId nor newAddress given', async () => {
    await expect(
      useCase.execute({ accountId: 'account-1', profileType: 'INDIVIDUAL' }),
    ).rejects.toThrow(InvalidProfileAddressInputError);
  });

  it('throws InvalidProfileAddressInputError when both addressId and newAddress given', async () => {
    await expect(
      useCase.execute({
        accountId: 'account-1',
        profileType: 'INDIVIDUAL',
        addressId: 'address-1',
        newAddress: {
          label: 'Home',
          province: 'HCM',
          provinceCode: 79,
          ward: 'Ward 1',
          details: '123 Street',
        },
      }),
    ).rejects.toThrow(InvalidProfileAddressInputError);
  });

  it('assigns an existing address to the new profile without changing address.profileId', async () => {
    addressRepository.findById.mockResolvedValue(
      buildAddress({ profileId: 'other-profile' }),
    );

    const profile = await useCase.execute({
      accountId: 'account-1',
      profileType: 'INDIVIDUAL',
      addressId: 'address-1',
    });

    expect(addressRepository.create).not.toHaveBeenCalled();
    expect(profile.addressId).toBe('address-1');
  });

  it('throws AddressNotFoundError when addressId does not belong to the account', async () => {
    addressRepository.findById.mockResolvedValue(
      buildAddress({ accountId: 'other-account' }),
    );

    await expect(
      useCase.execute({
        accountId: 'account-1',
        profileType: 'INDIVIDUAL',
        addressId: 'address-1',
      }),
    ).rejects.toThrow(AddressNotFoundError);
  });

  it('creates a new address linked to the profile when newAddress given', async () => {
    const profile = await useCase.execute({
      accountId: 'account-1',
      profileType: 'INDIVIDUAL',
      newAddress: {
        label: 'Home',
        province: 'HCM',
        provinceCode: 79,
        ward: 'Ward 1',
        details: '123 Street',
      },
    });

    expect(addressRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'account-1',
        profileId: 'profile-1',
      }),
    );
    expect(profile.addressId).not.toBeNull();
  });
});
