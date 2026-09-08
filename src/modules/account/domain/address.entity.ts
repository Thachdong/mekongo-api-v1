export type TAddressProps = {
  id: string | null;
  label: string;
  province: string;
  provinceCode: number;
  ward: string;
  details: string;
  accountId: string;
  profileId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export class Address {
  private readonly _id: string | null;
  private _label: string;
  private _province: string;
  private _provinceCode: number;
  private _ward: string;
  private _details: string;
  private readonly _accountId: string;
  private readonly _profileId: string | null;
  private readonly _createdAt: Date | null;
  private readonly _updatedAt: Date | null;

  constructor(props: TAddressProps) {
    this._id = props.id;
    this._label = props.label;
    this._province = props.province;
    this._provinceCode = props.provinceCode;
    this._ward = props.ward;
    this._details = props.details;
    this._accountId = props.accountId;
    this._profileId = props.profileId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | null {
    return this._id;
  }

  get label(): string {
    return this._label;
  }

  get province(): string {
    return this._province;
  }

  get provinceCode(): number {
    return this._provinceCode;
  }

  get ward(): string {
    return this._ward;
  }

  get details(): string {
    return this._details;
  }

  get accountId(): string {
    return this._accountId;
  }

  get profileId(): string | null {
    return this._profileId;
  }

  get createdAt(): Date | null {
    return this._createdAt;
  }

  get updatedAt(): Date | null {
    return this._updatedAt;
  }
}
