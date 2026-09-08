import { Address } from '../../../domain/address.entity';
import { Profile } from '../../../domain/profile.entity';
import { AddressNotFoundError } from '../../../domain/errors/address-not-found.error';
import { ProfileNotFoundError } from '../../../domain/errors/profile-not-found.error';
import { IAddressRepository } from '../../ports/address/address-repository.interface';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import { SetProfileAddressUseCase } from './set-profile-address.use-case';

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

describe('SetProfileAddressUseCase', () => {
  let profileRepository: jest.Mocked<IProfileRepository>;
  let addressRepository: jest.Mocked<IAddressRepository>;
  let useCase: SetProfileAddressUseCase;

  beforeEach(() => {
    profileRepository = {
      create: jest.fn(),
      update: jest.fn((profile: Profile) => Promise.resolve(profile)),
      findAllByAccountId: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
    };
    addressRepository = {
      create: jest.fn(),
      findAllByAccountId: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new SetProfileAddressUseCase(
      profileRepository,
      addressRepository,
    );
  });

  it('throws ProfileNotFoundError when profile does not exist', async () => {
    profileRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        accountId: 'account-1',
        profileId: 'profile-1',
        addressId: 'address-1',
      }),
    ).rejects.toThrow(ProfileNotFoundError);
  });

  it('throws ProfileNotFoundError when profile belongs to another account', async () => {
    profileRepository.findById.mockResolvedValue(
      buildProfile({ accountId: 'other-account' }),
    );

    await expect(
      useCase.execute({
        accountId: 'account-1',
        profileId: 'profile-1',
        addressId: 'address-1',
      }),
    ).rejects.toThrow(ProfileNotFoundError);
  });

  it('throws AddressNotFoundError when address does not exist', async () => {
    profileRepository.findById.mockResolvedValue(buildProfile());
    addressRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        accountId: 'account-1',
        profileId: 'profile-1',
        addressId: 'address-1',
      }),
    ).rejects.toThrow(AddressNotFoundError);
  });

  it('throws AddressNotFoundError when address belongs to another account', async () => {
    profileRepository.findById.mockResolvedValue(buildProfile());
    addressRepository.findById.mockResolvedValue(
      buildAddress({ accountId: 'other-account' }),
    );

    await expect(
      useCase.execute({
        accountId: 'account-1',
        profileId: 'profile-1',
        addressId: 'address-1',
      }),
    ).rejects.toThrow(AddressNotFoundError);
  });

  it('assigns the address to the profile on success', async () => {
    profileRepository.findById.mockResolvedValue(buildProfile());
    addressRepository.findById.mockResolvedValue(buildAddress());

    await useCase.execute({
      accountId: 'account-1',
      profileId: 'profile-1',
      addressId: 'address-1',
    });

    expect(profileRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ addressId: 'address-1' }),
    );
  });
});
