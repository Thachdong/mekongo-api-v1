import { Post } from '../../domain/post.entity';

export type TFindPostByIdInput = {
  postId: string;
};

export interface IFindPostByIdUseCase {
  execute(input: TFindPostByIdInput): Promise<Post>;
}
