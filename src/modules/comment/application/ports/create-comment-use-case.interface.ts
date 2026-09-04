import { Comment } from '../../domain/comment.entity';

export type TCreateCommentInput = {
  profileId: string | null;
  postId: string;
  parentId: string | null;
  content: string;
};

export interface ICreateCommentUseCase {
  execute(input: TCreateCommentInput): Promise<Comment>;
}
