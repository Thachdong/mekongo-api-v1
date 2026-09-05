export type TChatReadStateProps = {
  id: string | null;
  postId: string;
  buyerProfileId: string;
  profileId: string;
  lastReadAt: Date | null;
};

export class ChatReadState {
  private readonly _id: string | null;
  private readonly _postId: string;
  private readonly _buyerProfileId: string;
  private readonly _profileId: string;
  private readonly _lastReadAt: Date | null;

  constructor(props: TChatReadStateProps) {
    this._id = props.id;
    this._postId = props.postId;
    this._buyerProfileId = props.buyerProfileId;
    this._profileId = props.profileId;
    this._lastReadAt = props.lastReadAt;
  }

  static markRead(
    postId: string,
    buyerProfileId: string,
    profileId: string,
    readAt: Date,
  ): ChatReadState {
    return new ChatReadState({
      id: null,
      postId,
      buyerProfileId,
      profileId,
      lastReadAt: readAt,
    });
  }

  get id(): string | null {
    return this._id;
  }

  get postId(): string {
    return this._postId;
  }

  get buyerProfileId(): string {
    return this._buyerProfileId;
  }

  get profileId(): string {
    return this._profileId;
  }

  get lastReadAt(): Date | null {
    return this._lastReadAt;
  }
}
