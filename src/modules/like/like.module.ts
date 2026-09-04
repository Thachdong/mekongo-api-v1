import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from '@modules/post/post.module';
import {
  LIKE_REPOSITORY,
  TOGGLE_LIKE_USECASE,
} from './application/ports/like-application.tokens';
import { ToggleLikeUseCase } from './application/use-cases/toggle-like.use-case';
import { LikeController } from './infrastructure/http/like.controller';
import { LikeTypeOrmEntity } from './infrastructure/typeorm/entities/like.typeorm-entity';
import { TypeOrmLikeRepository } from './infrastructure/typeorm/like.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LikeTypeOrmEntity]), PostModule],
  controllers: [LikeController],
  providers: [
    { provide: LIKE_REPOSITORY, useClass: TypeOrmLikeRepository },
    ToggleLikeUseCase,
    { provide: TOGGLE_LIKE_USECASE, useExisting: ToggleLikeUseCase },
  ],
})
export class LikeModule {}
