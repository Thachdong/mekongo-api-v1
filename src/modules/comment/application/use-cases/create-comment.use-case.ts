import { Inject, Injectable } from '@nestjs/common';
import {
  FIND_POST_BY_ID_USECASE,
  IFindPostByIdUseCase,
} from '@modules/post/public-api';
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
  ) {}

  async execute(input: TCreateCommentInput): Promise<Comment> {
    if (!input.profileId) {
      throw new ProfileNotActiveError();
    }

    await this._findPostByIdUseCase.execute({ postId: input.postId });

    if (input.parentId) {
      const parent = await this._commentRepository.findById(input.parentId);

      if (!parent || parent.postId !== input.postId) {
        throw new ParentCommentNotFoundError();
      }
    }

    return this._commentRepository.create(
      new Comment({
        id: null,
        content: input.content,
        parentId: input.parentId,
        postId: input.postId,
        profileId: input.profileId as string,
        createdAt: null,
        updatedAt: null,
      }),
    );
  }
}
