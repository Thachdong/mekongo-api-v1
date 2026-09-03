import { IFileStorage } from '@shared/infrastructure/storage/file-storage.interface';
import { TMP_STORAGE_PREFIX } from '@shared/infrastructure/storage/storage-key.util';
import { GeneratePreSignUploadUrlsUseCase } from './generate-pre-sign-upload-urls.use-case';

describe('GeneratePreSignUploadUrlsUseCase', () => {
  let fileStorage: jest.Mocked<IFileStorage>;
  let useCase: GeneratePreSignUploadUrlsUseCase;

  beforeEach(() => {
    fileStorage = {
      getSignedUploadUrl: jest.fn(),
      getSignedDownloadUrl: jest.fn(),
      getPublicUrl: jest.fn(),
      moveObject: jest.fn(),
      deleteObject: jest.fn(),
    };
    useCase = new GeneratePreSignUploadUrlsUseCase(fileStorage);
  });

  it('builds one TMP key per file and returns matching presign URLs in order', async () => {
    fileStorage.getSignedUploadUrl.mockImplementation(
      async (key) => `https://signed-url/${key}`,
    );

    const result = await useCase.execute({
      files: ['a.png', 'b.png'],
    });

    expect(result.keys).toHaveLength(2);
    expect(result.presignUrls).toHaveLength(2);
    result.keys.forEach((key, index) => {
      expect(key).toMatch(new RegExp(`^${TMP_STORAGE_PREFIX}/.+-.+$`));
      expect(result.presignUrls[index]).toBe(`https://signed-url/${key}`);
    });
    expect(fileStorage.getSignedUploadUrl).toHaveBeenCalledTimes(2);
  });

  it('returns empty arrays when files is empty', async () => {
    const result = await useCase.execute({ files: [] });

    expect(result).toEqual({ keys: [], presignUrls: [] });
    expect(fileStorage.getSignedUploadUrl).not.toHaveBeenCalled();
  });
});
