export type TNotificationType = 'NEW_COMMENT' | 'NEW_REPLY';

export type TNotificationProps = {
  id: string | null;
  recipientProfileId: string;
  actorProfileId: string;
  type: TNotificationType;
  postId: string;
  commentId: string;
  contentPreview: string;
  isRead: boolean;
  createdAt: Date | null;
};

export class Notification {
  private readonly _id: string | null;
  private readonly _recipientProfileId: string;
  private readonly _actorProfileId: string;
  private readonly _type: TNotificationType;
  private readonly _postId: string;
  private readonly _commentId: string;
  private readonly _contentPreview: string;
  private _isRead: boolean;
  private readonly _createdAt: Date | null;

  constructor(props: TNotificationProps) {
    this._id = props.id;
    this._recipientProfileId = props.recipientProfileId;
    this._actorProfileId = props.actorProfileId;
    this._type = props.type;
    this._postId = props.postId;
    this._commentId = props.commentId;
    this._contentPreview = props.contentPreview;
    this._isRead = props.isRead;
    this._createdAt = props.createdAt;
  }

  get id(): string | null {
    return this._id;
  }

  get recipientProfileId(): string {
    return this._recipientProfileId;
  }

  get actorProfileId(): string {
    return this._actorProfileId;
  }

  get type(): TNotificationType {
    return this._type;
  }

  get postId(): string {
    return this._postId;
  }

  get commentId(): string {
    return this._commentId;
  }

  get contentPreview(): string {
    return this._contentPreview;
  }

  get isRead(): boolean {
    return this._isRead;
  }

  get createdAt(): Date | null {
    return this._createdAt;
  }

  markAsRead(): void {
    this._isRead = true;
  }
}
