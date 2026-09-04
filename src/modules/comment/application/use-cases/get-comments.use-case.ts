import { Inject, Injectable } from '@nestjs/common';
import { ResolveCommentAuthorsService } from '../services/resolve-comment-authors.service';
import { COMMENT_REPOSITORY } from '../ports/comment-application.tokens';
import { ICommentRepository } from '../ports/comment-repository.interface';
import {
  IGetCommentsUseCase,
  TCommentListItem,
  TGetCommentsInput,
  TGetCommentsOutput,
} from '../ports/get-comments-use-case.interface';

@Injectable()
export class GetCommentsUseCase implements IGetCommentsUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly _commentRepository: ICommentRepository,
    private readonly _resolveCommentAuthorsService: ResolveCommentAuthorsService,
  ) {}

  async execute(input: TGetCommentsInput): Promise<TGetCommentsOutput> {
    const { items, total } = await this._commentRepository.findRootByPostId(
      input.postId,
      input.page,
      input.limit,
    );

    if (items.length === 0) {
      return { items: [], total };
    }

    const commentIds = items.map((comment) => comment.id as string);
    const childrenCountByParentId =
      await this._commentRepository.countChildrenByParentIds(commentIds);
    const authorByProfileId =
      await this._resolveCommentAuthorsService.execute(items);

    const outputItems: TCommentListItem[] = items.map((comment) => ({
      id: comment.id as string,
      content: comment.content,
      level: comment.level,
      parentId: comment.parentId,
      childrenCount: childrenCountByParentId[comment.id as string] ?? 0,
      author: authorByProfileId.get(comment.profileId) ?? {
        profileId: comment.profileId,
        displayName: null,
        avatarUrl: null,
      },
    }));

    return { items: outputItems, total };
  }
}
