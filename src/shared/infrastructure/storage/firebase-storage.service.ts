import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { IFileStorage, TSignedUrlOptions } from './file-storage.interface';
import { FIREBASE_APP } from './storage.tokens';

@Injectable()
export class FirebaseStorageService implements IFileStorage {
  constructor(
    @Inject(FIREBASE_APP) private readonly _firebaseApp: App,
    private readonly _configService: ConfigService,
  ) {}

  private get _bucket() {
    return getStorage(this._firebaseApp).bucket();
  }

  async getSignedUploadUrl(
    key: string,
    options?: TSignedUrlOptions,
  ): Promise<string> {
    const [url] = await this._bucket.file(key).getSignedUrl({
      action: 'write',
      expires:
        Date.now() +
        (options?.expiresInMs ??
          this._configService.get<number>('firebase.uploadUrlTtlMs')),
      contentType: options?.contentType,
    });
    return url;
  }

  async getSignedDownloadUrl(
    key: string,
    expiresInMs?: number,
  ): Promise<string> {
    const [url] = await this._bucket.file(key).getSignedUrl({
      action: 'read',
      expires:
        Date.now() +
        (expiresInMs ??
          this._configService.get<number>('firebase.downloadUrlTtlMs')),
    });
    return url;
  }

  getPublicUrl(key: string): string {
    return `https://storage.googleapis.com/${this._bucket.name}/${key}`;
  }

  async moveObject(sourceKey: string, destinationKey: string): Promise<void> {
    await this._bucket.file(sourceKey).move(destinationKey);
  }

  async deleteObject(key: string): Promise<void> {
    await this._bucket.file(key).delete({ ignoreNotFound: true });
  }
}
