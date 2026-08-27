import { AccountBlockedError } from './errors/account-blocked.error';
import { InvalidAccountStatusTransitionError } from './errors/invalid-account-status-transition.error';
import { TAccountLoginType } from './value-objects/account-login-type.enum';
import { TAccountStatus } from './value-objects/account-status.enum';

export type TAccountProps = {
  id: string | null;
  loginType: TAccountLoginType;
  identifierHash: string;
  passwordHash: string;
  status: TAccountStatus;
  blockUntil: Date | null;
  displayName: string;
  avatarUrl: string | null;
  currentAddressId: string | null;
  activeProfileId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export class Account {
  private readonly _id: string | null;
  private readonly _loginType: TAccountLoginType;
  private readonly _identifierHash: string;
  private _passwordHash: string;
  private _status: TAccountStatus;
  private _blockUntil: Date | null;
  private _displayName: string;
  private _avatarUrl: string | null;
  private _currentAddressId: string | null;
  private _activeProfileId: string | null;
  private readonly _createdAt: Date | null;
  private readonly _updatedAt: Date | null;

  constructor(props: TAccountProps) {
    this._id = props.id;
    this._loginType = props.loginType;
    this._identifierHash = props.identifierHash;
    this._passwordHash = props.passwordHash;
    this._status = props.status;
    this._blockUntil = props.blockUntil;
    this._displayName = props.displayName;
    this._avatarUrl = props.avatarUrl;
    this._currentAddressId = props.currentAddressId;
    this._activeProfileId = props.activeProfileId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | null {
    return this._id;
  }

  get loginType(): TAccountLoginType {
    return this._loginType;
  }

  get identifierHash(): string {
    return this._identifierHash;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get status(): TAccountStatus {
    return this._status;
  }

  get blockUntil(): Date | null {
    return this._blockUntil;
  }

  get displayName(): string {
    return this._displayName;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get currentAddressId(): string | null {
    return this._currentAddressId;
  }

  get activeProfileId(): string | null {
    return this._activeProfileId;
  }

  get createdAt(): Date | null {
    return this._createdAt;
  }

  get updatedAt(): Date | null {
    return this._updatedAt;
  }

  changePaswordHash(passwordHash: string): void {
    this._passwordHash = passwordHash;
  }

  activate(): void {
    if (this._status !== 'PENDING_FOR_VERIFICATION') {
      throw new InvalidAccountStatusTransitionError(this._status, 'ACTIVE');
    }
    this._status = 'ACTIVE';
  }

  block(blockUntil: Date): void {
    this._status = 'BLOCKED';
    this._blockUntil = blockUntil;
  }

  checkIsBlock(): boolean {
    if (this._status !== 'BLOCKED') {
      return false;
    }
    if (!this._blockUntil) {
      return true;
    }
    if (this._blockUntil.getTime() > Date.now()) {
      return true;
    }
    this._status = 'ACTIVE';
    this._blockUntil = null;
    return false;
  }

  changeDisplayName(displayName: string): void {
    this._displayName = displayName;
  }

  changeAvatar(avatarUrl: string): void {
    this._avatarUrl = avatarUrl;
  }

  changeCurrentAddressId(addressId: string): void {
    this._currentAddressId = addressId;
  }

  changeActiveProfileId(profileId: string): void {
    this._activeProfileId = profileId;
  }

  assertNotBlocked(): void {
    if (this.checkIsBlock()) {
      throw new AccountBlockedError(this._blockUntil as Date);
    }
  }
}
