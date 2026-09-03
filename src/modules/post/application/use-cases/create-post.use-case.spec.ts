import {
  IFindAccountByIdUseCase,
  IGetAccountAddressesUseCase,
} from '@modules/account/public-api';
import { IFileStorage } from '@shared/infrastructure/storage/file-storage.interface';
import { CurrentAddressNotFoundError } from '../../domain/errors/current-address-not-found.error';
import { PostImageSourceInvalidError } from '../../domain/errors/post-image-source-invalid.error';
import { ProfileNotActiveError } from '../../domain/errors/profile-not-active.error';
import { Post } from '../../domain/post.entity';
import { IPostRepository } from '../ports/post-repository.interface';
import { CreatePostUseCase } from './create-post.use-case';

function buildAddress(overrides: Record<string, unknown> = {}) {
  return {
    id: 'address-id',
    provinceCode: 79,
    ...overrides,
  } as any;
}

function buildAccount(overrides: Record<string, unknown> = {}) {
  return {
    id: 'account-id',
    currentAddressId: 'address-id',
    ...overrides,
  } as any;
}

describe('CreatePostUseCase', () => {
  let postRepository: jest.Mocked<IPostRepository>;
  let findAccountByIdUseCase: jest.Mocked<IFindAccountByIdUseCase>;
  let getAccountAddressesUseCase: jest.Mocked<IGetAccountAddressesUseCase>;
  let fileStorage: jest.Mocked<IFileStorage>;
  let useCase: CreatePostUseCase;

  const baseInput = {
    accountId: 'account-id',
    profileId: 'profile-id',
    postType: 'SELL' as const,
    title: 'Bán xoài cát Hòa Lộc',
    content: 'content',
    images: ['TMP/uuid-1-a.png', 'TMP/uuid-2-b.png'],
  };

  beforeEach(() => {
    postRepository = { create: jest.fn(), findById: jest.fn() };
    findAccountByIdUseCase = { execute: jest.fn() };
    getAccountAddressesUseCase = { execute: jest.fn() };
    fileStorage = {
      getSignedUploadUrl: jest.fn(),
      getSignedDownloadUrl: jest.fn(),
      getPublicUrl: jest.fn(),
      moveObject: jest.fn(),
      deleteObject: jest.fn(),
    };

    findAccountByIdUseCase.execute.mockResolvedValue(buildAccount());
    getAccountAddressesUseCase.execute.mockResolvedValue([buildAddress()]);
    fileStorage.moveObject.mockResolvedValue(undefined);
    postRepository.create.mockImplementation(async (post) => post);

    useCase = new CreatePostUseCase(
      postRepository,
      findAccountByIdUseCase,
      getAccountAddressesUseCase,
      fileStorage,
    );
  });

  it('throws ProfileNotActiveError when profileId is null', async () => {
    await expect(
      useCase.execute({ ...baseInput, profileId: null }),
    ).rejects.toThrow(ProfileNotActiveError);

    expect(postRepository.create).not.toHaveBeenCalled();
  });

  it('throws CurrentAddressNotFoundError when no address matches account.currentAddressId', async () => {
    getAccountAddressesUseCase.execute.mockResolvedValue([
      buildAddress({ id: 'other-address-id' }),
    ]);

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      CurrentAddressNotFoundError,
    );

    expect(postRepository.create).not.toHaveBeenCalled();
  });

  it('throws PostImageSourceInvalidError when an image key is not a TMP key', async () => {
    await expect(
      useCase.execute({ ...baseInput, images: ['OTHER/foo.png'] }),
    ).rejects.toThrow(PostImageSourceInvalidError);

    expect(fileStorage.moveObject).not.toHaveBeenCalled();
    expect(postRepository.create).not.toHaveBeenCalled();
  });

  it('throws PostImageSourceInvalidError when moveObject fails', async () => {
    fileStorage.moveObject.mockRejectedValue(new Error('not found'));

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      PostImageSourceInvalidError,
    );

    expect(postRepository.create).not.toHaveBeenCalled();
  });

  it('moves images to POST/<slug-title>/ and creates the post with resolved provinceCode/profileId', async () => {
    const post = await useCase.execute(baseInput);

    expect(fileStorage.moveObject).toHaveBeenCalledWith(
      'TMP/uuid-1-a.png',
      'POST/ban-xoai-cat-hoa-loc/uuid-1-a.png',
    );
    expect(fileStorage.moveObject).toHaveBeenCalledWith(
      'TMP/uuid-2-b.png',
      'POST/ban-xoai-cat-hoa-loc/uuid-2-b.png',
    );

    expect(postRepository.create).toHaveBeenCalledTimes(1);
    const createdPost = postRepository.create.mock.calls[0][0];
    expect(createdPost).toBeInstanceOf(Post);
    expect(createdPost.provinceCode).toBe(79);
    expect(createdPost.profileId).toBe('profile-id');
    expect(createdPost.images).toEqual([
      'POST/ban-xoai-cat-hoa-loc/uuid-1-a.png',
      'POST/ban-xoai-cat-hoa-loc/uuid-2-b.png',
    ]);
    expect(createdPost.likeCount).toBe(0);
    expect(createdPost.commentCount).toBe(0);
    expect(post).toBe(createdPost);
  });
});
