import { Comment } from '../../domain/comment.entity';

export type TFindRootByPostIdResult = {
  items: Comment[];
  total: number;
};

export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  update(comment: Comment): Promise<Comment>;
  delete(id: string): Promise<void>;
  hasChildren(commentId: string): Promise<boolean>;
  findRootByPostId(
    postId: string,
    page: number,
    limit: number,
  ): Promise<TFindRootByPostIdResult>;
  countChildrenByParentIds(
    parentIds: string[],
  ): Promise<Record<string, number>>;
}
