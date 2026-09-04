export {
  FIND_POST_BY_ID_USECASE,
  INCREMENT_POST_LIKE_COUNT_USECASE,
  DECREMENT_POST_LIKE_COUNT_USECASE,
} from './application/ports/post-application.tokens';

export type {
  IFindPostByIdUseCase,
  TFindPostByIdInput,
} from './application/ports/find-post-by-id-use-case.interface';

export type {
  IIncrementPostLikeCountUseCase,
  TIncrementPostLikeCountInput,
} from './application/ports/increment-post-like-count-use-case.interface';

export type {
  IDecrementPostLikeCountUseCase,
  TDecrementPostLikeCountInput,
} from './application/ports/decrement-post-like-count-use-case.interface';
