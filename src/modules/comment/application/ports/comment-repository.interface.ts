import { Comment } from '../../domain/comment.entity';

export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  update(comment: Comment): Promise<Comment>;
  delete(id: string): Promise<void>;
}
