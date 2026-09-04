import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '@shared/infrastructure/storage/storage.module';
import { AccountModule } from '@modules/account/account.module';
import {
  CREATE_POST_USECASE,
  DECREMENT_POST_LIKE_COUNT_USECASE,
  FIND_POST_BY_ID_USECASE,
  INCREMENT_POST_LIKE_COUNT_USECASE,
  POST_REPOSITORY,
} from './application/ports/post-application.tokens';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { DecrementPostLikeCountUseCase } from './application/use-cases/decrement-post-like-count.use-case';
import { FindPostByIdUseCase } from './application/use-cases/find-post-by-id.use-case';
import { IncrementPostLikeCountUseCase } from './application/use-cases/increment-post-like-count.use-case';
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
    IncrementPostLikeCountUseCase,
    {
      provide: INCREMENT_POST_LIKE_COUNT_USECASE,
      useExisting: IncrementPostLikeCountUseCase,
    },
    DecrementPostLikeCountUseCase,
    {
      provide: DECREMENT_POST_LIKE_COUNT_USECASE,
      useExisting: DecrementPostLikeCountUseCase,
    },
    { provide: POST_REPOSITORY, useClass: TypeOrmPostRepository },
  ],
  exports: [
    FIND_POST_BY_ID_USECASE,
    INCREMENT_POST_LIKE_COUNT_USECASE,
    DECREMENT_POST_LIKE_COUNT_USECASE,
  ],
})
export class PostModule {}
