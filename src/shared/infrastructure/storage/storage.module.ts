import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { firebaseAdminProvider } from './firebase-admin.provider';
import { FirebaseStorageService } from './firebase-storage.service';
import { FILE_STORAGE } from './storage.tokens';

@Module({
  imports: [ConfigModule],
  providers: [
    firebaseAdminProvider,
    {
      provide: FILE_STORAGE,
      useClass: FirebaseStorageService,
    },
  ],
  exports: [FILE_STORAGE],
})
export class StorageModule {}
