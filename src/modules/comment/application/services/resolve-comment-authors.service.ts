import { Inject, Injectable } from '@nestjs/common';
import {
  FIND_ACCOUNTS_BY_IDS_USECASE,
  FIND_PROFILES_BY_IDS_USECASE,
  IFindAccountsByIdsUseCase,
  IFindProfilesByIdsUseCase,
} from '@modules/account/public-api';
import { Comment } from '../../domain/comment.entity';
import { TCommentAuthor } from '../ports/get-comments-use-case.interface';

@Injectable()
export class ResolveCommentAuthorsService {
  constructor(
    @Inject(FIND_PROFILES_BY_IDS_USECASE)
    private readonly _findProfilesByIdsUseCase: IFindProfilesByIdsUseCase,
    @Inject(FIND_ACCOUNTS_BY_IDS_USECASE)
    private readonly _findAccountsByIdsUseCase: IFindAccountsByIdsUseCase,
  ) {}

  async execute(comments: Comment[]): Promise<Map<string, TCommentAuthor>> {
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
