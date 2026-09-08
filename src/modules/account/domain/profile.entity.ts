import { TProfileType } from './value-objects/profile-type.enum';

export type TProfileProps = {
  id: string | null;
  activeProfile: TProfileType;
  accountId: string;
  displayName: string;
  avatarUrl: string | null;
  addressId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export class Profile {
  private readonly _id: string | null;
  private _activeProfile: TProfileType;
  private readonly _accountId: string;
  private _displayName: string;
  private _avatarUrl: string | null;
  private _addressId: string | null;
  private readonly _createdAt: Date | null;
  private readonly _updatedAt: Date | null;

  constructor(props: TProfileProps) {
    this._id = props.id;
    this._activeProfile = props.activeProfile;
    this._accountId = props.accountId;
    this._displayName = props.displayName;
    this._avatarUrl = props.avatarUrl;
    this._addressId = props.addressId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | null {
    return this._id;
  }

  get activeProfile(): TProfileType {
    return this._activeProfile;
  }

  get accountId(): string {
    return this._accountId;
  }

  get displayName(): string {
    return this._displayName;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get addressId(): string | null {
    return this._addressId;
  }

  get createdAt(): Date | null {
    return this._createdAt;
  }

  get updatedAt(): Date | null {
    return this._updatedAt;
  }

  changeActiveProfile(activeProfile: TProfileType): void {
    this._activeProfile = activeProfile;
  }

  changeAddressId(addressId: string): void {
    this._addressId = addressId;
  }

  changeDisplayName(displayName: string): void {
    this._displayName = displayName;
  }

  changeAvatarUrl(avatarUrl: string | null): void {
    this._avatarUrl = avatarUrl;
  }
}
