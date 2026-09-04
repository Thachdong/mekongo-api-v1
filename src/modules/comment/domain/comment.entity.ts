export type TCommentProps = {
  id: string | null;
  content: string;
  parentId: string | null;
  postId: string;
  profileId: string;
  level: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export class Comment {
  private readonly _id: string | null;
  private _content: string;
  private readonly _parentId: string | null;
  private readonly _postId: string;
  private readonly _profileId: string;
  private readonly _level: number;
  private readonly _createdAt: Date | null;
  private readonly _updatedAt: Date | null;

  constructor(props: TCommentProps) {
    this._id = props.id;
    this._content = props.content;
    this._parentId = props.parentId;
    this._postId = props.postId;
    this._profileId = props.profileId;
    this._level = props.level;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | null {
    return this._id;
  }

  get content(): string {
    return this._content;
  }

  get parentId(): string | null {
    return this._parentId;
  }

  get postId(): string {
    return this._postId;
  }

  get profileId(): string {
    return this._profileId;
  }

  get level(): number {
    return this._level;
  }

  get createdAt(): Date | null {
    return this._createdAt;
  }

  get updatedAt(): Date | null {
    return this._updatedAt;
  }

  updateContent(content: string): void {
    this._content = content;
  }
}
