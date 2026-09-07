import { IAddressRepository } from '../../ports/address/address-repository.interface';
import { CreateAddressUseCase } from './create-address.use-case';

describe('CreateAddressUseCase', () => {
  let addressRepository: jest.Mocked<IAddressRepository>;
  let useCase: CreateAddressUseCase;

  beforeEach(() => {
    addressRepository = {
      create: jest.fn(),
      findAllByAccountId: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateAddressUseCase(addressRepository);
  });

  it('creates an address with profileId when provided', async () => {
    addressRepository.create.mockImplementation((address) =>
      Promise.resolve(address),
    );

    const result = await useCase.execute({
      accountId: 'account-1',
      label: 'Home',
      province: 'HCM',
      provinceCode: 79,
      ward: 'Ward 1',
      details: '123 Street',
      profileId: 'profile-1',
    });

    expect(result.profileId).toBe('profile-1');
    expect(result.accountId).toBe('account-1');
  });

  it('creates an address with profileId null when not provided', async () => {
    addressRepository.create.mockImplementation((address) =>
      Promise.resolve(address),
    );

    const result = await useCase.execute({
      accountId: 'account-1',
      label: 'Home',
      province: 'HCM',
      provinceCode: 79,
      ward: 'Ward 1',
      details: '123 Street',
    });

    expect(result.profileId).toBeNull();
  });
});
