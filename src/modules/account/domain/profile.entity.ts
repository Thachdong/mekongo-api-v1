import { TProfileType } from './value-objects/profile-type.enum';

export type TProfileProps = {
  id: string | null;
  activeProfile: TProfileType;
  accountId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export class Profile {
  private readonly _id: string | null;
  private _activeProfile: TProfileType;
  private readonly _accountId: string;
  private readonly _createdAt: Date | null;
  private readonly _updatedAt: Date | null;

  constructor(props: TProfileProps) {
    this._id = props.id;
    this._activeProfile = props.activeProfile;
    this._accountId = props.accountId;
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

  get createdAt(): Date | null {
    return this._createdAt;
  }

  get updatedAt(): Date | null {
    return this._updatedAt;
  }

  changeActiveProfile(activeProfile: TProfileType): void {
    this._activeProfile = activeProfile;
  }
}
