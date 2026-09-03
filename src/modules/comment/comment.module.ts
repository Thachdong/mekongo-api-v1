import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from '@modules/post/post.module';
import {
  COMMENT_REPOSITORY,
  CREATE_COMMENT_USECASE,
  DELETE_COMMENT_USECASE,
  TRANSACTION_MANAGER,
} from './application/ports/comment-application.tokens';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { CommentController } from './infrastructure/http/comment.controller';
import { CommentTypeOrmEntity } from './infrastructure/typeorm/entities/comment.typeorm-entity';
import { TypeOrmCommentRepository } from './infrastructure/typeorm/comment.repository';
import { TypeOrmCommentTransactionManager } from './infrastructure/typeorm/typeorm-transaction-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentTypeOrmEntity]), PostModule],
  controllers: [CommentController],
  providers: [
    { provide: COMMENT_REPOSITORY, useClass: TypeOrmCommentRepository },
    {
      provide: TRANSACTION_MANAGER,
      useClass: TypeOrmCommentTransactionManager,
    },
    CreateCommentUseCase,
    { provide: CREATE_COMMENT_USECASE, useExisting: CreateCommentUseCase },
    DeleteCommentUseCase,
    { provide: DELETE_COMMENT_USECASE, useExisting: DeleteCommentUseCase },
  ],
})
export class CommentModule {}
