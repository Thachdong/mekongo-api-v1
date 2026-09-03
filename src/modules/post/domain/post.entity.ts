import { ImageNotFoundError } from './errors/image-not-found.error';
import { InvalidCountOperationError } from './errors/invalid-count-operation.error';
import { TPostType } from './value-objects/post-type.enum';

export type TPostProps = {
  id: string | null;
  postType: TPostType;
  title: string;
  content: string;
  images: string[];
  provinceCode: number;
  profileId: string;
  likeCount: number;
  commentCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export class Post {
  private readonly _id: string | null;
  private readonly _postType: TPostType;
  private _title: string;
  private _content: string;
  private _images: string[];
  private readonly _provinceCode: number;
  private readonly _profileId: string;
  private _likeCount: number;
  private _commentCount: number;
  private readonly _createdAt: Date | null;
  private readonly _updatedAt: Date | null;

  constructor(props: TPostProps) {
    this._id = props.id;
    this._postType = props.postType;
    this._title = props.title;
    this._content = props.content;
    this._images = props.images;
    this._provinceCode = props.provinceCode;
    this._profileId = props.profileId;
    this._likeCount = props.likeCount;
    this._commentCount = props.commentCount;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | null {
    return this._id;
  }

  get postType(): TPostType {
    return this._postType;
  }

  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get images(): string[] {
    return this._images;
  }

  get provinceCode(): number {
    return this._provinceCode;
  }

  get profileId(): string {
    return this._profileId;
  }

  get likeCount(): number {
    return this._likeCount;
  }

  get commentCount(): number {
    return this._commentCount;
  }

  get createdAt(): Date | null {
    return this._createdAt;
  }

  get updatedAt(): Date | null {
    return this._updatedAt;
  }

  updateTitle(title: string): void {
    this._title = title;
  }

  updateContent(content: string): void {
    this._content = content;
  }

  addImage(image: string): void {
    this._images = [...this._images, image];
  }

  removeImage(image: string): void {
    if (!this._images.includes(image)) {
      throw new ImageNotFoundError();
    }
    this._images = this._images.filter((img) => img !== image);
  }

  addLikeCount(): void {
    this._likeCount += 1;
  }

  minusLikeCount(): void {
    if (this._likeCount <= 0) {
      throw new InvalidCountOperationError('likeCount');
    }
    this._likeCount -= 1;
  }

  addCommentCount(): void {
    this._commentCount += 1;
  }

  minusCommentCount(): void {
    if (this._commentCount <= 0) {
      throw new InvalidCountOperationError('commentCount');
    }
    this._commentCount -= 1;
  }
}
