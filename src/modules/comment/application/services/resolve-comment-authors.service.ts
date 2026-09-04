import { Inject, Injectable } from '@nestjs/common';
import {
  FIND_PROFILES_BY_IDS_USECASE,
  IFindProfilesByIdsUseCase,
} from '@modules/account/public-api';
import { Comment } from '../../domain/comment.entity';
import { TCommentAuthor } from '../ports/get-comments-use-case.interface';

@Injectable()
export class ResolveCommentAuthorsService {
  constructor(
    @Inject(FIND_PROFILES_BY_IDS_USECASE)
    private readonly _findProfilesByIdsUseCase: IFindProfilesByIdsUseCase,
  ) {}

  async execute(comments: Comment[]): Promise<Map<string, TCommentAuthor>> {
    const profileIds = [...new Set(comments.map((c) => c.profileId))];
    const profiles = await this._findProfilesByIdsUseCase.execute({
      profileIds,
    });

    const authorByProfileId = new Map<string, TCommentAuthor>();
    for (const profile of profiles) {
      authorByProfileId.set(profile.id as string, {
        profileId: profile.id as string,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      });
    }

    return authorByProfileId;
  }
}
