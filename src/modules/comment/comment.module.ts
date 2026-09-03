import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  COMMENT_REPOSITORY,
  TRANSACTION_MANAGER,
} from './application/ports/comment-application.tokens';
import { CommentTypeOrmEntity } from './infrastructure/typeorm/entities/comment.typeorm-entity';
import { TypeOrmCommentRepository } from './infrastructure/typeorm/comment.repository';
import { TypeOrmCommentTransactionManager } from './infrastructure/typeorm/typeorm-transaction-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentTypeOrmEntity])],
  providers: [
    { provide: COMMENT_REPOSITORY, useClass: TypeOrmCommentRepository },
    {
      provide: TRANSACTION_MANAGER,
      useClass: TypeOrmCommentTransactionManager,
    },
  ],
})
export class CommentModule {}
