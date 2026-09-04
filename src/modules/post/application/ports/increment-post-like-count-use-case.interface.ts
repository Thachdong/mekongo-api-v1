import { Post } from '../../domain/post.entity';

export type TIncrementPostLikeCountInput = {
  postId: string;
};

export interface IIncrementPostLikeCountUseCase {
  execute(input: TIncrementPostLikeCountInput): Promise<Post>;
}
