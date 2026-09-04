import { Post } from '../../domain/post.entity';

export type TDecrementPostLikeCountInput = {
  postId: string;
};

export interface IDecrementPostLikeCountUseCase {
  execute(input: TDecrementPostLikeCountInput): Promise<Post>;
}
