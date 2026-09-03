import { Account, TAccountProps } from '../../domain/account.entity';
import { AccountNotFoundError } from '../../domain/errors/account-not-found.error';
import { AvatarSourceNotFoundError } from '../../domain/errors/avatar-source-not-found.error';
import { InvalidDisplayNameError } from '../../domain/errors/invalid-display-name.error';
import { IFileStorage } from '@shared/infrastructure/storage/file-storage.interface';
import { IAccountRepository } from '../ports/account-repository.interface';
import { UpdateAccountProfileUseCase } from './update-account-profile.use-case';

function buildAccount(overrides: Partial<TAccountProps> = {}) {
  return new Account({
    id: 'account-id',
    loginType: 'PHONE',
    identifierHash: 'identifier-hash',
    passwordHash: 'password-hash',
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

describe('UpdateAccountProfileUseCase', () => {
  let accountRepository: jest.Mocked<IAccountRepository>;
  let fileStorage: jest.Mocked<IFileStorage>;
  let useCase: UpdateAccountProfileUseCase;

  beforeEach(() => {
    accountRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByIdentifierHash: jest.fn(),
    };
    fileStorage = {
      getSignedUploadUrl: jest.fn(),
      getSignedDownloadUrl: jest.fn(),
      getPublicUrl: jest.fn(),
      moveObject: jest.fn(),
      deleteObject: jest.fn(),
    };
    useCase = new UpdateAccountProfileUseCase(accountRepository, fileStorage);
  });

  it('throws AccountNotFoundError when account does not exist', async () => {
    accountRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ accountId: 'account-id', displayName: 'new-name' }),
    ).rejects.toThrow(AccountNotFoundError);

    expect(accountRepository.update).not.toHaveBeenCalled();
  });

  it('trims and updates displayName', async () => {
    const account = buildAccount();
    accountRepository.findById.mockResolvedValue(account);

    await useCase.execute({
      accountId: 'account-id',
      displayName: '  new-name  ',
    });

    expect(account.displayName).toBe('new-name');
    expect(accountRepository.update).toHaveBeenCalledWith(account);
  });

  it('throws InvalidDisplayNameError when displayName is shorter than 5 chars after trim', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());

    await expect(
      useCase.execute({ accountId: 'account-id', displayName: '  ab  ' }),
    ).rejects.toThrow(InvalidDisplayNameError);

    expect(accountRepository.update).not.toHaveBeenCalled();
  });

  it('throws AvatarSourceNotFoundError when avatarUrl does not start with TMP/', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());

    await expect(
      useCase.execute({ accountId: 'account-id', avatarUrl: 'other/key.png' }),
    ).rejects.toThrow(AvatarSourceNotFoundError);

    expect(fileStorage.moveObject).not.toHaveBeenCalled();
    expect(accountRepository.update).not.toHaveBeenCalled();
  });

  it('moves avatar from TMP to ACCOUNT bucket and stores destination key', async () => {
    const account = buildAccount();
    accountRepository.findById.mockResolvedValue(account);
    fileStorage.moveObject.mockResolvedValue(undefined);

    await useCase.execute({
      accountId: 'account-id',
      avatarUrl: 'TMP/uuid-avatar.png',
    });

    expect(fileStorage.moveObject).toHaveBeenCalledWith(
      'TMP/uuid-avatar.png',
      'ACCOUNT/account-id/uuid-avatar.png',
    );
    expect(account.avatarUrl).toBe('ACCOUNT/account-id/uuid-avatar.png');
    expect(accountRepository.update).toHaveBeenCalledWith(account);
  });

  it('throws AvatarSourceNotFoundError when moveObject fails', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());
    fileStorage.moveObject.mockRejectedValue(new Error('not found'));

    await expect(
      useCase.execute({
        accountId: 'account-id',
        avatarUrl: 'TMP/uuid-avatar.png',
      }),
    ).rejects.toThrow(AvatarSourceNotFoundError);

    expect(accountRepository.update).not.toHaveBeenCalled();
  });
});
