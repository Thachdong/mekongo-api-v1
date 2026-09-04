import { Inject, Injectable } from '@nestjs/common';
import { ParentCommentNotFoundError } from '../../domain/errors/parent-comment-not-found.error';
import { ResolveCommentAuthorsService } from '../services/resolve-comment-authors.service';
import { COMMENT_REPOSITORY } from '../ports/comment-application.tokens';
import { ICommentRepository } from '../ports/comment-repository.interface';
import {
  IGetCommentChildrenUseCase,
  TGetCommentChildrenInput,
} from '../ports/get-comment-children-use-case.interface';
import { TCommentListItem } from '../ports/get-comments-use-case.interface';

@Injectable()
export class GetCommentChildrenUseCase implements IGetCommentChildrenUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly _commentRepository: ICommentRepository,
    private readonly _resolveCommentAuthorsService: ResolveCommentAuthorsService,
  ) {}

  async execute(input: TGetCommentChildrenInput): Promise<TCommentListItem[]> {
    const parent = await this._commentRepository.findById(input.parentId);

    if (!parent || parent.postId !== input.postId) {
      throw new ParentCommentNotFoundError();
    }

    const children = await this._commentRepository.findDirectChildren(
      input.parentId,
    );

    if (children.length === 0) {
      return [];
    }

    const authorByProfileId =
      await this._resolveCommentAuthorsService.execute(children);

    return children.map((comment) => ({
      id: comment.id as string,
      content: comment.content,
      level: comment.level,
      parentId: comment.parentId,
      author: authorByProfileId.get(comment.profileId) ?? {
        profileId: comment.profileId,
        displayName: null,
        avatarUrl: null,
      },
    }));
  }
}
