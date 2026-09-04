import { Like } from '../../domain/like.entity';

export interface ILikeRepository {
  create(like: Like): Promise<Like>;
  findByPostAndProfile(postId: string, profileId: string): Promise<Like | null>;
  delete(id: string): Promise<void>;
}
