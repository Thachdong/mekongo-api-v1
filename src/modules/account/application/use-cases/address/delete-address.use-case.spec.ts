import { Address } from '../../../domain/address.entity';
import { Profile } from '../../../domain/profile.entity';
import { AddressAssignedToProfileError } from '../../../domain/errors/address-assigned-to-profile.error';
import { AddressNotFoundError } from '../../../domain/errors/address-not-found.error';
import { IAddressRepository } from '../../ports/address/address-repository.interface';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import { DeleteAddressUseCase } from './delete-address.use-case';

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

describe('DeleteAddressUseCase', () => {
  let addressRepository: jest.Mocked<IAddressRepository>;
  let profileRepository: jest.Mocked<IProfileRepository>;
  let useCase: DeleteAddressUseCase;

  beforeEach(() => {
    addressRepository = {
      create: jest.fn(),
      findAllByAccountId: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    profileRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findAllByAccountId: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      findByIds: jest.fn(),
    };

    useCase = new DeleteAddressUseCase(addressRepository, profileRepository);
  });

  it('throws AddressNotFoundError when address does not exist', async () => {
    addressRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ accountId: 'account-1', addressId: 'address-1' }),
    ).rejects.toThrow(AddressNotFoundError);
  });

  it('throws AddressNotFoundError when address belongs to another account', async () => {
    addressRepository.findById.mockResolvedValue(
      buildAddress({ accountId: 'other-account' }),
    );

    await expect(
      useCase.execute({ accountId: 'account-1', addressId: 'address-1' }),
    ).rejects.toThrow(AddressNotFoundError);
  });

  it('throws AddressAssignedToProfileError when a profile uses this address', async () => {
    addressRepository.findById.mockResolvedValue(buildAddress());
    profileRepository.findAllByAccountId.mockResolvedValue([
      buildProfile({ addressId: 'address-1' }),
    ]);

    await expect(
      useCase.execute({ accountId: 'account-1', addressId: 'address-1' }),
    ).rejects.toThrow(AddressAssignedToProfileError);

    expect(addressRepository.delete).not.toHaveBeenCalled();
  });

  it('deletes the address when no profile is using it', async () => {
    addressRepository.findById.mockResolvedValue(buildAddress());
    profileRepository.findAllByAccountId.mockResolvedValue([
      buildProfile({ addressId: 'other-address' }),
    ]);

    await useCase.execute({ accountId: 'account-1', addressId: 'address-1' });

    expect(addressRepository.delete).toHaveBeenCalledWith('address-1');
  });
});
