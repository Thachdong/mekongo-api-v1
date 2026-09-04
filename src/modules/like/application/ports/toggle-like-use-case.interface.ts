export type TToggleLikeInput = {
  postId: string;
  profileId: string;
};

export interface IToggleLikeUseCase {
  execute(input: TToggleLikeInput): Promise<void>;
}
