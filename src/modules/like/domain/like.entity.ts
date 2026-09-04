import { TReactionType } from './value-objects/reaction-type.enum';

export type TLikeProps = {
  id: string | null;
  postId: string;
  profileId: string;
  reactionType: TReactionType;
  createdAt: Date | null;
};

export class Like {
  private readonly _id: string | null;
  private readonly _postId: string;
  private readonly _profileId: string;
  private _reactionType: TReactionType;
  private readonly _createdAt: Date | null;

  constructor(props: TLikeProps) {
    this._id = props.id;
    this._postId = props.postId;
    this._profileId = props.profileId;
    this._reactionType = props.reactionType;
    this._createdAt = props.createdAt;
  }

  get id(): string | null {
    return this._id;
  }

  get postId(): string {
    return this._postId;
  }

  get profileId(): string {
    return this._profileId;
  }

  get reactionType(): TReactionType {
    return this._reactionType;
  }

  get createdAt(): Date | null {
    return this._createdAt;
  }

  updateReactionType(reactionType: TReactionType): void {
    this._reactionType = reactionType;
  }
}
