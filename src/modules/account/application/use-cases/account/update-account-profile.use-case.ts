import { Inject, Injectable } from '@nestjs/common';
import { FILE_STORAGE } from '@shared/infrastructure/storage/storage.tokens';
import { IFileStorage } from '@shared/infrastructure/storage/file-storage.interface';
import { TMP_STORAGE_PREFIX } from '@shared/infrastructure/storage/storage-key.util';
import { AccountNotFoundError } from '../../../domain/errors/account-not-found.error';
import { AvatarSourceNotFoundError } from '../../../domain/errors/avatar-source-not-found.error';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import {
  IUpdateAccountProfileUseCase,
  TUpdateAccountProfileInput,
} from '../../ports/account/update-account-profile-use-case.interface';
import { ACCOUNT_REPOSITORY } from '../../ports/account-application.tokens';

@Injectable()
export class UpdateAccountProfileUseCase implements IUpdateAccountProfileUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly _accountRepository: IAccountRepository,
    @Inject(FILE_STORAGE)
    private readonly _fileStorage: IFileStorage,
  ) {}

  async execute(input: TUpdateAccountProfileInput): Promise<void> {
    const account = await this._accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    if (input.displayName !== undefined) {
      account.changeDisplayName(input.displayName);
    }

    if (input.avatarUrl !== undefined) {
      const destinationKey = await this._moveAvatarFromTmp(
        input.accountId,
        input.avatarUrl,
      );
      account.changeAvatar(destinationKey);
    }

    await this._accountRepository.update(account);
  }

  private async _moveAvatarFromTmp(
    accountId: string,
    sourceKey: string,
  ): Promise<string> {
    if (!sourceKey.startsWith(`${TMP_STORAGE_PREFIX}/`)) {
      throw new AvatarSourceNotFoundError();
    }

    const fileName = sourceKey.slice(TMP_STORAGE_PREFIX.length + 1);
    const destinationKey = `ACCOUNT/${accountId}/${fileName}`;

    try {
      await this._fileStorage.moveObject(sourceKey, destinationKey);
    } catch {
      throw new AvatarSourceNotFoundError();
    }

    return destinationKey;
  }
}
