import { Inject, Injectable } from '@nestjs/common';
import {
  DECREMENT_POST_LIKE_COUNT_USECASE,
  FIND_POST_BY_ID_USECASE,
  IDecrementPostLikeCountUseCase,
  IFindPostByIdUseCase,
  IIncrementPostLikeCountUseCase,
  INCREMENT_POST_LIKE_COUNT_USECASE,
} from '@modules/post/public-api';
import { Like } from '../../domain/like.entity';
import { LIKE_REPOSITORY } from '../ports/like-application.tokens';
import { ILikeRepository } from '../ports/like-repository.interface';
import {
  IToggleLikeUseCase,
  TToggleLikeInput,
} from '../ports/toggle-like-use-case.interface';

@Injectable()
export class ToggleLikeUseCase implements IToggleLikeUseCase {
  constructor(
    @Inject(LIKE_REPOSITORY)
    private readonly _likeRepository: ILikeRepository,
    @Inject(FIND_POST_BY_ID_USECASE)
    private readonly _findPostByIdUseCase: IFindPostByIdUseCase,
    @Inject(INCREMENT_POST_LIKE_COUNT_USECASE)
    private readonly _incrementPostLikeCountUseCase: IIncrementPostLikeCountUseCase,
    @Inject(DECREMENT_POST_LIKE_COUNT_USECASE)
    private readonly _decrementPostLikeCountUseCase: IDecrementPostLikeCountUseCase,
  ) {}

  async execute(input: TToggleLikeInput): Promise<void> {
    await this._findPostByIdUseCase.execute({ postId: input.postId });

    const existing = await this._likeRepository.findByPostAndProfile(
      input.postId,
      input.profileId,
    );

    if (existing) {
      await this._likeRepository.delete(existing.id as string);
      await this._decrementPostLikeCountUseCase.execute({
        postId: input.postId,
      });
      return;
    }

    await this._likeRepository.create(
      new Like({
        id: null,
        postId: input.postId,
        profileId: input.profileId,
        reactionType: 'LIKE',
        createdAt: null,
      }),
    );
    await this._incrementPostLikeCountUseCase.execute({
      postId: input.postId,
    });
  }
}
