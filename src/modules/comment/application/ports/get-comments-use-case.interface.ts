export type TCommentAuthor = {
  profileId: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type TCommentListItem = {
  id: string;
  content: string;
  level: number;
  parentId: string | null;
  childrenCount?: number;
  author: TCommentAuthor;
};

export type TGetCommentsInput = {
  postId: string;
  page: number;
  limit: number;
};

export type TGetCommentsOutput = {
  items: TCommentListItem[];
  total: number;
};

export interface IGetCommentsUseCase {
  execute(input: TGetCommentsInput): Promise<TGetCommentsOutput>;
}
