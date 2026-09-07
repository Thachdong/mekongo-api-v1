export interface ICommentPresencePort {
  isViewingPost(postId: string, profileId: string): boolean;
}
