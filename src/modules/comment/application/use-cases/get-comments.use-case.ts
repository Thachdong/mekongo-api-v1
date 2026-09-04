import { Inject, Injectable } from '@nestjs/common';
import {
  FIND_ACCOUNTS_BY_IDS_USECASE,
  FIND_PROFILES_BY_IDS_USECASE,
  IFindAccountsByIdsUseCase,
  IFindProfilesByIdsUseCase,
} from '@modules/account/public-api';
import { Comment } from '../../domain/comment.entity';
import { COMMENT_REPOSITORY } from '../ports/comment-application.tokens';
import { ICommentRepository } from '../ports/comment-repository.interface';
import {
  IGetCommentsUseCase,
  TCommentAuthor,
  TCommentListItem,
  TGetCommentsInput,
  TGetCommentsOutput,
} from '../ports/get-comments-use-case.interface';

@Injectable()
export class GetCommentsUseCase implements IGetCommentsUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly _commentRepository: ICommentRepository,
    @Inject(FIND_PROFILES_BY_IDS_USECASE)
    private readonly _findProfilesByIdsUseCase: IFindProfilesByIdsUseCase,
    @Inject(FIND_ACCOUNTS_BY_IDS_USECASE)
    private readonly _findAccountsByIdsUseCase: IFindAccountsByIdsUseCase,
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
    const authorByProfileId = await this._resolveAuthors(items);

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

  private async _resolveAuthors(
    comments: Comment[],
  ): Promise<Map<string, TCommentAuthor>> {
    const profileIds = [...new Set(comments.map((c) => c.profileId))];
    const profiles = await this._findProfilesByIdsUseCase.execute({
      profileIds,
    });

    const accountIds = [...new Set(profiles.map((p) => p.accountId))];
    const accounts = await this._findAccountsByIdsUseCase.execute({
      accountIds,
    });
    const accountById = new Map(accounts.map((a) => [a.id as string, a]));

    const authorByProfileId = new Map<string, TCommentAuthor>();
    for (const profile of profiles) {
      const account = accountById.get(profile.accountId);
      authorByProfileId.set(profile.id as string, {
        profileId: profile.id as string,
        displayName: account?.displayName ?? null,
        avatarUrl: account?.avatarUrl ?? null,
      });
    }

    return authorByProfileId;
  }
}
