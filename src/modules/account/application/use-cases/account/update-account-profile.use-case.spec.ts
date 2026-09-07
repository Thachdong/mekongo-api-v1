import { Account, TAccountProps } from '../../../domain/account.entity';
import { Profile, TProfileProps } from '../../../domain/profile.entity';
import { AccountNotFoundError } from '../../../domain/errors/account-not-found.error';
import { AvatarSourceNotFoundError } from '../../../domain/errors/avatar-source-not-found.error';
import { ProfileNotFoundError } from '../../../domain/errors/profile-not-found.error';
import { IFileStorage } from '@shared/infrastructure/storage/file-storage.interface';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import { IProfileRepository } from '../../ports/profile-repository.interface';
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
    activeProfileId: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

function buildProfile(overrides: Partial<TProfileProps> = {}) {
  return new Profile({
    id: 'profile-id',
    activeProfile: 'INDIVIDUAL',
    accountId: 'account-id',
    displayName: 'display-name',
    avatarUrl: null,
    addressId: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

describe('UpdateAccountProfileUseCase', () => {
  let accountRepository: jest.Mocked<IAccountRepository>;
  let profileRepository: jest.Mocked<IProfileRepository>;
  let fileStorage: jest.Mocked<IFileStorage>;
  let useCase: UpdateAccountProfileUseCase;

  beforeEach(() => {
    accountRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByIdentifierHash: jest.fn(),
    };
    profileRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findAllByAccountId: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
    };
    fileStorage = {
      getSignedUploadUrl: jest.fn(),
      getSignedDownloadUrl: jest.fn(),
      getPublicUrl: jest.fn(),
      moveObject: jest.fn(),
      deleteObject: jest.fn(),
    };
    useCase = new UpdateAccountProfileUseCase(
      accountRepository,
      profileRepository,
      fileStorage,
    );
  });

  it('throws AccountNotFoundError when account does not exist', async () => {
    accountRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        accountId: 'account-id',
        profileId: 'profile-id',
        displayName: 'new-name',
      }),
    ).rejects.toThrow(AccountNotFoundError);

    expect(profileRepository.update).not.toHaveBeenCalled();
  });

  it('throws ProfileNotFoundError when profile does not exist', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());
    profileRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        accountId: 'account-id',
        profileId: 'profile-id',
        displayName: 'new-name',
      }),
    ).rejects.toThrow(ProfileNotFoundError);

    expect(profileRepository.update).not.toHaveBeenCalled();
  });

  it('throws ProfileNotFoundError when profile belongs to another account', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());
    profileRepository.findById.mockResolvedValue(
      buildProfile({ accountId: 'other-account' }),
    );

    await expect(
      useCase.execute({
        accountId: 'account-id',
        profileId: 'profile-id',
        displayName: 'new-name',
      }),
    ).rejects.toThrow(ProfileNotFoundError);

    expect(profileRepository.update).not.toHaveBeenCalled();
  });

  it('updates displayName on the profile', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());
    const profile = buildProfile();
    profileRepository.findById.mockResolvedValue(profile);

    await useCase.execute({
      accountId: 'account-id',
      profileId: 'profile-id',
      displayName: 'new-name',
    });

    expect(profile.displayName).toBe('new-name');
    expect(profileRepository.update).toHaveBeenCalledWith(profile);
  });

  it('throws AvatarSourceNotFoundError when avatarUrl does not start with TMP/', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());
    profileRepository.findById.mockResolvedValue(buildProfile());

    await expect(
      useCase.execute({
        accountId: 'account-id',
        profileId: 'profile-id',
        avatarUrl: 'other/key.png',
      }),
    ).rejects.toThrow(AvatarSourceNotFoundError);

    expect(fileStorage.moveObject).not.toHaveBeenCalled();
    expect(profileRepository.update).not.toHaveBeenCalled();
  });

  it('moves avatar from TMP to ACCOUNT bucket and stores destination key on the profile', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());
    const profile = buildProfile();
    profileRepository.findById.mockResolvedValue(profile);
    fileStorage.moveObject.mockResolvedValue(undefined);

    await useCase.execute({
      accountId: 'account-id',
      profileId: 'profile-id',
      avatarUrl: 'TMP/uuid-avatar.png',
    });

    expect(fileStorage.moveObject).toHaveBeenCalledWith(
      'TMP/uuid-avatar.png',
      'ACCOUNT/account-id/uuid-avatar.png',
    );
    expect(profile.avatarUrl).toBe('ACCOUNT/account-id/uuid-avatar.png');
    expect(profileRepository.update).toHaveBeenCalledWith(profile);
  });

  it('throws AvatarSourceNotFoundError when moveObject fails', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());
    profileRepository.findById.mockResolvedValue(buildProfile());
    fileStorage.moveObject.mockRejectedValue(new Error('not found'));

    await expect(
      useCase.execute({
        accountId: 'account-id',
        profileId: 'profile-id',
        avatarUrl: 'TMP/uuid-avatar.png',
      }),
    ).rejects.toThrow(AvatarSourceNotFoundError);

    expect(profileRepository.update).not.toHaveBeenCalled();
  });

  it('updates both displayName and avatarUrl', async () => {
    accountRepository.findById.mockResolvedValue(buildAccount());
    const profile = buildProfile();
    profileRepository.findById.mockResolvedValue(profile);
    fileStorage.moveObject.mockResolvedValue(undefined);

    await useCase.execute({
      accountId: 'account-id',
      profileId: 'profile-id',
      displayName: 'new-name',
      avatarUrl: 'TMP/uuid-avatar.png',
    });

    expect(profile.displayName).toBe('new-name');
    expect(profile.avatarUrl).toBe('ACCOUNT/account-id/uuid-avatar.png');
    expect(profileRepository.update).toHaveBeenCalledWith(profile);
  });
});
