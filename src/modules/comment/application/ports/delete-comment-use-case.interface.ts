export type TDeleteCommentInput = {
  profileId: string | null;
  commentId: string;
};

export interface IDeleteCommentUseCase {
  execute(input: TDeleteCommentInput): Promise<void>;
}
