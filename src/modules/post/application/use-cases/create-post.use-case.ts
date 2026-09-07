import { Inject, Injectable } from '@nestjs/common';
import { FILE_STORAGE } from '@shared/infrastructure/storage/storage.tokens';
import { IFileStorage } from '@shared/infrastructure/storage/file-storage.interface';
import { TMP_STORAGE_PREFIX } from '@shared/infrastructure/storage/storage-key.util';
import {
  Address,
  FIND_PROFILES_BY_IDS_USECASE,
  GET_ACCOUNT_ADDRESSES_USECASE,
  IFindProfilesByIdsUseCase,
  IGetAccountAddressesUseCase,
} from '@modules/account/public-api';
import { CurrentAddressNotFoundError } from '../../domain/errors/current-address-not-found.error';
import { PostImageSourceInvalidError } from '../../domain/errors/post-image-source-invalid.error';
import { ProfileNotActiveError } from '../../domain/errors/profile-not-active.error';
import { Post } from '../../domain/post.entity';
import {
  ICreatePostUseCase,
  TCreatePostInput,
} from '../ports/create-post-use-case.interface';
import { POST_REPOSITORY } from '../ports/post-application.tokens';
import { IPostRepository } from '../ports/post-repository.interface';

@Injectable()
export class CreatePostUseCase implements ICreatePostUseCase {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly _postRepository: IPostRepository,
    @Inject(FIND_PROFILES_BY_IDS_USECASE)
    private readonly _findProfilesByIdsUseCase: IFindProfilesByIdsUseCase,
    @Inject(GET_ACCOUNT_ADDRESSES_USECASE)
    private readonly _getAccountAddressesUseCase: IGetAccountAddressesUseCase,
    @Inject(FILE_STORAGE)
    private readonly _fileStorage: IFileStorage,
  ) {}

  async execute(input: TCreatePostInput): Promise<Post> {
    if (!input.profileId) {
      throw new ProfileNotActiveError();
    }

    const provinceCode = await this._resolveProvinceCode(
      input.accountId,
      input.profileId,
    );

    const images = await Promise.all(
      input.images.map((image) => this._moveImageFromTmp(input.title, image)),
    );

    const post = new Post({
      id: null,
      postType: input.postType,
      title: input.title,
      content: input.content,
      images,
      provinceCode,
      profileId: input.profileId,
      likeCount: 0,
      commentCount: 0,
      createdAt: null,
      updatedAt: null,
    });

    return this._postRepository.create(post);
  }

  private async _resolveProvinceCode(
    accountId: string,
    profileId: string,
  ): Promise<number> {
    const [profile] = await this._findProfilesByIdsUseCase.execute({
      profileIds: [profileId],
    });
    const addresses = await this._getAccountAddressesUseCase.execute({
      accountId,
    });

    const address = profile
      ? addresses.find((a: Address) => a.id === profile.addressId)
      : undefined;

    if (!address) {
      throw new CurrentAddressNotFoundError();
    }

    return address.provinceCode;
  }

  private async _moveImageFromTmp(
    title: string,
    sourceKey: string,
  ): Promise<string> {
    if (!sourceKey.startsWith(`${TMP_STORAGE_PREFIX}/`)) {
      throw new PostImageSourceInvalidError();
    }

    const fileName = sourceKey.slice(TMP_STORAGE_PREFIX.length + 1);
    const destinationKey = `POST/${this._slugify(title)}/${fileName}`;

    try {
      await this._fileStorage.moveObject(sourceKey, destinationKey);
    } catch {
      throw new PostImageSourceInvalidError();
    }

    return destinationKey;
  }

  private _slugify(title: string): string {
    const normalized = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'untitled';
  }
}
