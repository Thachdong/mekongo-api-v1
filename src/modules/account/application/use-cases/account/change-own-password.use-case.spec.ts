import { Account, TAccountProps } from '../../../domain/account.entity';
import { AccountNotFoundError } from '../../../domain/errors/account-not-found.error';
import { InvalidCurrentPasswordError } from '../../../domain/errors/invalid-current-password.error';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import { IChangeAccountPasswordUseCase } from '../../ports/account/change-account-password-use-case.interface';
import { IPasswordHasher } from '@shared/common/hashing/password-hasher.interface';
import { ChangeOwnPasswordUseCase } from './change-own-password.use-case';

function buildAccount(overrides: Partial<TAccountProps> = {}) {
  return new Account({
    id: 'account-id',
    loginType: 'PHONE',
    identifierHash: 'identifier-hash',
    passwordHash: 'current-password-hash',
    status: 'ACTIVE',
    blockUntil: null,
    displayName: 'display-name',
    avatarUrl: null,
    currentAddressId: null,
    activeProfileId: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

describe('ChangeOwnPasswordUseCase', () => {
  let accountRepository: jest.Mocked<IAccountRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let changeAccountPasswordUseCase: jest.Mocked<IChangeAccountPasswordUseCase>;
  let useCase: ChangeOwnPasswordUseCase;

  beforeEach(() => {
    accountRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByIdentifierHash: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    };
    changeAccountPasswordUseCase = {
      execute: jest.fn(),
    };
    useCase = new ChangeOwnPasswordUseCase(
      accountRepository,
      passwordHasher,
      changeAccountPasswordUseCase,
    );
  });

  it('throws AccountNotFoundError when account does not exist', async () => {
    accountRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        accountId: 'account-id',
        currentPassword: 'current-password',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(AccountNotFoundError);

    expect(passwordHasher.verify).not.toHaveBeenCalled();
    expect(changeAccountPasswordUseCase.execute).not.toHaveBeenCalled();
  });

  it('throws InvalidCurrentPasswordError when current password does not match', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      useCase.execute({
        accountId: 'account-id',
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(InvalidCurrentPasswordError);

    expect(passwordHasher.verify).toHaveBeenCalledWith(
      'wrong-password',
      'current-password-hash',
    );
    expect(changeAccountPasswordUseCase.execute).not.toHaveBeenCalled();
  });

  it('hashes new password and delegates update when current password matches', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());
    passwordHasher.verify.mockResolvedValue(true);
    passwordHasher.hash.mockResolvedValue('new-password-hash');

    await useCase.execute({
      accountId: 'account-id',
      currentPassword: 'current-password',
      newPassword: 'new-password',
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith('new-password');
    expect(changeAccountPasswordUseCase.execute).toHaveBeenCalledWith({
      accountId: 'account-id',
      passwordHash: 'new-password-hash',
    });
  });
});
