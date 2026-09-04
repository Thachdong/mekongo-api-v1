import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '@modules/account/account.module';
import { PostModule } from '@modules/post/post.module';
import {
  COMMENT_REPOSITORY,
  CREATE_COMMENT_USECASE,
  DELETE_COMMENT_USECASE,
  GET_COMMENT_CHILDREN_USECASE,
  GET_COMMENTS_USECASE,
} from './application/ports/comment-application.tokens';
import { ResolveCommentAuthorsService } from './application/services/resolve-comment-authors.service';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { GetCommentChildrenUseCase } from './application/use-cases/get-comment-children.use-case';
import { GetCommentsUseCase } from './application/use-cases/get-comments.use-case';
import { CommentController } from './infrastructure/http/comment.controller';
import { CommentTypeOrmEntity } from './infrastructure/typeorm/entities/comment.typeorm-entity';
import { TypeOrmCommentRepository } from './infrastructure/typeorm/comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentTypeOrmEntity]),
    PostModule,
    AccountModule,
  ],
  controllers: [CommentController],
  providers: [
    { provide: COMMENT_REPOSITORY, useClass: TypeOrmCommentRepository },
    CreateCommentUseCase,
    { provide: CREATE_COMMENT_USECASE, useExisting: CreateCommentUseCase },
    DeleteCommentUseCase,
    { provide: DELETE_COMMENT_USECASE, useExisting: DeleteCommentUseCase },
    GetCommentsUseCase,
    { provide: GET_COMMENTS_USECASE, useExisting: GetCommentsUseCase },
    GetCommentChildrenUseCase,
    {
      provide: GET_COMMENT_CHILDREN_USECASE,
      useExisting: GetCommentChildrenUseCase,
    },
    ResolveCommentAuthorsService,
  ],
})
export class CommentModule {}
