import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '@shared/infrastructure/storage/storage.module';
import { AccountModule } from '@modules/account/account.module';
import {
  CREATE_POST_USECASE,
  POST_REPOSITORY,
} from './application/ports/post-application.tokens';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { PostController } from './infrastructure/http/post.controller';
import { PostTypeOrmEntity } from './infrastructure/typeorm/entities/post.typeorm-entity';
import { TypeOrmPostRepository } from './infrastructure/typeorm/post.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostTypeOrmEntity]),
    StorageModule,
    AccountModule,
  ],
  controllers: [PostController],
  providers: [
    CreatePostUseCase,
    { provide: CREATE_POST_USECASE, useExisting: CreatePostUseCase },
    { provide: POST_REPOSITORY, useClass: TypeOrmPostRepository },
  ],
})
export class PostModule {}
