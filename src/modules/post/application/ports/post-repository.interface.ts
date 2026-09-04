import { Post } from '../../domain/post.entity';

export interface IPostRepository {
  create(post: Post): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  update(post: Post): Promise<Post>;
}
