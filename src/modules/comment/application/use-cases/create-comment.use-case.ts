import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TCommentConfig } from '@config/comment.config';
import {
  FIND_POST_BY_ID_USECASE,
  IFindPostByIdUseCase,
} from '@modules/post/public-api';
import { CommentLevelLimitExceededError } from '../../domain/errors/comment-level-limit-exceeded.error';
import { ParentCommentNotFoundError } from '../../domain/errors/parent-comment-not-found.error';
import { ProfileNotActiveError } from '../../domain/errors/profile-not-active.error';
import { Comment } from '../../domain/comment.entity';
import { COMMENT_REPOSITORY } from '../ports/comment-application.tokens';
import { ICommentRepository } from '../ports/comment-repository.interface';
import {
  ICreateCommentUseCase,
  TCreateCommentInput,
} from '../ports/create-comment-use-case.interface';

@Injectable()
export class CreateCommentUseCase implements ICreateCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly _commentRepository: ICommentRepository,
    @Inject(FIND_POST_BY_ID_USECASE)
    private readonly _findPostByIdUseCase: IFindPostByIdUseCase,
    private readonly _configService: ConfigService,
  ) {}

  async execute(input: TCreateCommentInput): Promise<Comment> {
    if (!input.profileId) {
      throw new ProfileNotActiveError();
    }

    await this._findPostByIdUseCase.execute({ postId: input.postId });

    let level = 0;

    if (input.parentId) {
      const parent = await this._commentRepository.findById(input.parentId);

      if (!parent || parent.postId !== input.postId) {
        throw new ParentCommentNotFoundError();
      }

      level = parent.level + 1;
    }

    const commentConfig =
      this._configService.getOrThrow<TCommentConfig>('comment');

    if (level >= commentConfig.levelLimit) {
      throw new CommentLevelLimitExceededError();
    }

    return this._commentRepository.create(
      new Comment({
        id: null,
        content: input.content,
        parentId: input.parentId,
        postId: input.postId,
        profileId: input.profileId as string,
        level,
        createdAt: null,
        updatedAt: null,
      }),
    );
  }
}
