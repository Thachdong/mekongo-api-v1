import { EmptyChatContentError } from './errors/empty-chat-content.error';

export type TChatProps = {
  id: string | null;
  postId: string;
  ownerProfileId: string;
  buyerProfileId: string;
  senderProfileId: string;
  content: string;
  createdAt: Date | null;
};

export class Chat {
  private readonly _id: string | null;
  private readonly _postId: string;
  private readonly _ownerProfileId: string;
  private readonly _buyerProfileId: string;
  private readonly _senderProfileId: string;
  private readonly _content: string;
  private readonly _createdAt: Date | null;

  constructor(props: TChatProps) {
    if (!props.content.trim()) {
      throw new EmptyChatContentError();
    }

    this._id = props.id;
    this._postId = props.postId;
    this._ownerProfileId = props.ownerProfileId;
    this._buyerProfileId = props.buyerProfileId;
    this._senderProfileId = props.senderProfileId;
    this._content = props.content;
    this._createdAt = props.createdAt;
  }

  get id(): string | null {
    return this._id;
  }

  get postId(): string {
    return this._postId;
  }

  get ownerProfileId(): string {
    return this._ownerProfileId;
  }

  get buyerProfileId(): string {
    return this._buyerProfileId;
  }

  get senderProfileId(): string {
    return this._senderProfileId;
  }

  get content(): string {
    return this._content;
  }

  get createdAt(): Date | null {
    return this._createdAt;
  }
}
