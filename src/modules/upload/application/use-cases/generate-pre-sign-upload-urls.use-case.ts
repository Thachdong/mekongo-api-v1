import { Inject, Injectable } from '@nestjs/common';
import { FILE_STORAGE } from '@shared/infrastructure/storage/storage.tokens';
import { IFileStorage } from '@shared/infrastructure/storage/file-storage.interface';
import { buildTmpObjectKey } from '@shared/infrastructure/storage/storage-key.util';
import {
  IGeneratePreSignUploadUrlsUseCase,
  TGeneratePreSignUploadUrlsInput,
  TGeneratePreSignUploadUrlsOutput,
} from '../ports/generate-pre-sign-upload-urls-use-case.interface';

@Injectable()
export class GeneratePreSignUploadUrlsUseCase implements IGeneratePreSignUploadUrlsUseCase {
  constructor(
    @Inject(FILE_STORAGE)
    private readonly _fileStorage: IFileStorage,
  ) {}

  async execute(
    input: TGeneratePreSignUploadUrlsInput,
  ): Promise<TGeneratePreSignUploadUrlsOutput> {
    const keys = input.files.map((fileName) => buildTmpObjectKey(fileName));
    const presignUrls = await Promise.all(
      keys.map((key) => this._fileStorage.getSignedUploadUrl(key)),
    );

    return { keys, presignUrls };
  }
}
