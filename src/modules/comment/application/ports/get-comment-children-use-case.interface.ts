import { TCommentListItem } from './get-comments-use-case.interface';

export type TGetCommentChildrenInput = {
  postId: string;
  parentId: string;
};

export interface IGetCommentChildrenUseCase {
  execute(input: TGetCommentChildrenInput): Promise<TCommentListItem[]>;
}
