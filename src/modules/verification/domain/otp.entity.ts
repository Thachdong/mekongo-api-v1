import { TOtpBlockType } from './value-objects/otp-block-type.enum';
import { TOtpPurpose } from './value-objects/otp-purpose.enum';

export type TOtpProps = {
  id: string | null;
  purpose: TOtpPurpose;
  identifier: string;
  accountId: string;
  codeHash: string;
  expiredAt: Date;
  retryCount: number;
  wrongCount: number;
  blockType: TOtpBlockType | null;
  blockUntil: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type TOtpBlockState = {
  blockType: TOtpBlockType;
  blockUntil: Date;
};

export class Otp {
  private readonly _id: string | null;
  private readonly _purpose: TOtpPurpose;
  private readonly _identifier: string;
  private readonly _accountId: string;
  private readonly _codeHash: string;
  private readonly _expiredAt: Date;
  private _retryCount: number;
  private _wrongCount: number;
  private _blockType: TOtpBlockType | null;
  private _blockUntil: Date | null;
  private readonly _createdAt: Date | null;
  private readonly _updatedAt: Date | null;

  constructor(props: TOtpProps) {
    this._id = props.id;
    this._purpose = props.purpose;
    this._identifier = props.identifier;
    this._accountId = props.accountId;
    this._codeHash = props.codeHash;
    this._expiredAt = props.expiredAt;
    this._retryCount = props.retryCount;
    this._wrongCount = props.wrongCount;
    this._blockType = props.blockType;
    this._blockUntil = props.blockUntil;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | null {
    return this._id;
  }

  get purpose(): TOtpPurpose {
    return this._purpose;
  }

  get identifier(): string {
    return this._identifier;
  }

  get accountId(): string {
    return this._accountId;
  }

  get codeHash(): string {
    return this._codeHash;
  }

  get expiredAt(): Date {
    return this._expiredAt;
  }

  get blockType(): TOtpBlockType | null {
    return this._blockType;
  }

  get blockUntil(): Date | null {
    return this._blockUntil;
  }

  get createdAt(): Date | null {
    return this._createdAt;
  }

  get updatedAt(): Date | null {
    return this._updatedAt;
  }

  get wrongCount(): number {
    return this._wrongCount;
  }

  checkIsExpired(): boolean {
    return this._expiredAt.getTime() <= Date.now();
  }

  checkIsBlocked(): TOtpBlockState | null {
    if (!this._blockType || !this._blockUntil) {
      return null;
    }
    if (this._blockUntil.getTime() > Date.now()) {
      return { blockType: this._blockType, blockUntil: this._blockUntil };
    }
    this._blockType = null;
    this._blockUntil = null;
    return null;
  }

  compareCodeHash(codeHash: string): boolean {
    return this._codeHash === codeHash;
  }

  increaseRetryCount(): void {
    this._retryCount += 1;
  }

  getRetryCount(): number {
    return this._retryCount;
  }

  increaseWrongCount(): void {
    this._wrongCount += 1;
  }

  block(blockType: TOtpBlockType, blockUntil: Date): void {
    this._blockType = blockType;
    this._blockUntil = blockUntil;
  }

  registerWrongAttempt(
    maxWrongCount: number,
    blockDurationMs: number,
  ): TOtpBlockState | null {
    this._wrongCount += 1;
    if (this._wrongCount < maxWrongCount) {
      return null;
    }
    const blockUntil = new Date(Date.now() + blockDurationMs);
    this.block('WRONG_LIMIT', blockUntil);
    return { blockType: 'WRONG_LIMIT', blockUntil };
  }
}
