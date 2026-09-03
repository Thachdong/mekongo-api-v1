import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '@shared/infrastructure/storage/storage.module';
import { AccountModule } from '@modules/account/account.module';
import {
  CREATE_POST_USECASE,
  FIND_POST_BY_ID_USECASE,
  POST_REPOSITORY,
} from './application/ports/post-application.tokens';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { FindPostByIdUseCase } from './application/use-cases/find-post-by-id.use-case';
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
    FindPostByIdUseCase,
    { provide: FIND_POST_BY_ID_USECASE, useExisting: FindPostByIdUseCase },
    { provide: POST_REPOSITORY, useClass: TypeOrmPostRepository },
  ],
  exports: [FIND_POST_BY_ID_USECASE],
})
export class PostModule {}
