export type TSignedUrlOptions = {
  contentType?: string;
  expiresInMs?: number;
};

export interface IFileStorage {
  getSignedUploadUrl(key: string, options?: TSignedUrlOptions): Promise<string>;
  getSignedDownloadUrl(key: string, expiresInMs?: number): Promise<string>;
  getPublicUrl(key: string): string;
  moveObject(sourceKey: string, destinationKey: string): Promise<void>;
  deleteObject(key: string): Promise<void>;
}
