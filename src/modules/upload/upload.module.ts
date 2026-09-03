import { Module } from '@nestjs/common';
import { StorageModule } from '@shared/infrastructure/storage/storage.module';
import { GeneratePreSignUploadUrlsUseCase } from './application/use-cases/generate-pre-sign-upload-urls.use-case';
import { UploadController } from './infrastructure/http/upload.controller';

@Module({
  imports: [StorageModule],
  controllers: [UploadController],
  providers: [GeneratePreSignUploadUrlsUseCase],
})
export class UploadModule {}
