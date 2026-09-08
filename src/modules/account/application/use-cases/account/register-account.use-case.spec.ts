import { Account } from '../../../domain/account.entity';
import { Address } from '../../../domain/address.entity';
import { Profile } from '../../../domain/profile.entity';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import { IAddressRepository } from '../../ports/address/address-repository.interface';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import { ITransactionManager } from '../../ports/transaction-manager.interface';
import { TRegisterAccountInput } from '../../ports/account/register-account-use-case.interface';
import { RegisterAccountUseCase } from './register-account.use-case';

describe('RegisterAccountUseCase', () => {
  let accountRepository: jest.Mocked<IAccountRepository>;
  let addressRepository: jest.Mocked<IAddressRepository>;
  let profileRepository: jest.Mocked<IProfileRepository>;
  let transactionManager: ITransactionManager;
  let useCase: RegisterAccountUseCase;

  const input: TRegisterAccountInput = {
    loginType: 'PHONE',
    identifierHash: 'identifier-hash',
    passwordHash: 'password-hash',
    displayName: 'display-name',
    avatarUrl: null,
    address: {
      label: 'Home',
      province: 'HCM',
      provinceCode: 79,
      ward: 'Ward 1',
      details: '123 Street',
    },
    profileType: 'INDIVIDUAL',
  };

  beforeEach(() => {
    accountRepository = {
      create: jest.fn((account: Account) =>
        Promise.resolve(
          new Account({
            id: 'account-1',
            loginType: account.loginType,
            identifierHash: account.identifierHash,
            passwordHash: account.passwordHash,
            status: account.status,
            blockUntil: account.blockUntil,
            displayName: account.displayName,
            avatarUrl: account.avatarUrl,
            activeProfileId: account.activeProfileId,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
          }),
        ),
      ),
      update: jest.fn((account: Account) => Promise.resolve(account)),
      findById: jest.fn(),
      findByIdentifierHash: jest.fn(),
    };
    addressRepository = {
      create: jest.fn((address: Address) =>
        Promise.resolve(
          new Address({
            id: 'address-1',
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
      findAllByAccountId: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
    };
    transactionManager = {
      runInTransaction: jest.fn((work) => work()),
    };

    useCase = new RegisterAccountUseCase(
      accountRepository,
      addressRepository,
      profileRepository,
      transactionManager,
    );
  });

  it('creates account, profile (addressId null first), then address linked to the profile, then assigns address back to the profile', async () => {
    const result = await useCase.execute(input);

    expect(profileRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ addressId: null, accountId: 'account-1' }),
    );
    expect(addressRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'account-1',
        profileId: 'profile-1',
      }),
    );
    expect(profileRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ addressId: 'address-1' }),
    );
    expect(accountRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ activeProfileId: 'profile-1' }),
    );

    expect(result.account.activeProfileId).toBe('profile-1');
    expect(result.address.profileId).toBe('profile-1');
    expect(result.profile.addressId).toBe('address-1');
  });
});
