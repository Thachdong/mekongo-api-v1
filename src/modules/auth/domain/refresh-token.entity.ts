import { RefreshTokenExpiredError } from './errors/refresh-token-expired.error';
import { RefreshTokenRevokedError } from './errors/refresh-token-revoked.error';

export type TRefreshTokenProps = {
  id: string | null;
  accountId: string;
  currentTokenHash: string;
  previousTokenHash: string | null;
  expiredAt: Date;
  revokedAt: Date | null;
  isAlive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export class RefreshToken {
  private readonly _id: string | null;
  private readonly _accountId: string;
  private _currentTokenHash: string;
  private _previousTokenHash: string | null;
  private _expiredAt: Date;
  private _revokedAt: Date | null;
  private _isAlive: boolean;
  private readonly _createdAt: Date | null;
  private readonly _updatedAt: Date | null;

  constructor(props: TRefreshTokenProps) {
    this._id = props.id;
    this._accountId = props.accountId;
    this._currentTokenHash = props.currentTokenHash;
    this._previousTokenHash = props.previousTokenHash;
    this._expiredAt = props.expiredAt;
    this._revokedAt = props.revokedAt;
    this._isAlive = props.isAlive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | null {
    return this._id;
  }

  get accountId(): string {
    return this._accountId;
  }

  get currentTokenHash(): string {
    return this._currentTokenHash;
  }

  get previousTokenHash(): string | null {
    return this._previousTokenHash;
  }

  get expiredAt(): Date {
    return this._expiredAt;
  }

  get revokedAt(): Date | null {
    return this._revokedAt;
  }

  get isAlive(): boolean {
    return this._isAlive;
  }

  get createdAt(): Date | null {
    return this._createdAt;
  }

  get updatedAt(): Date | null {
    return this._updatedAt;
  }

  checkIsExpired(): boolean {
    return this._expiredAt.getTime() <= Date.now();
  }

  checkReusedDetected(presentedTokenHash: string): boolean {
    if (
      this._previousTokenHash &&
      presentedTokenHash === this._previousTokenHash
    ) {
      this._isAlive = false;
      this._revokedAt = new Date();
      return true;
    }
    return false;
  }

  revoke(): void {
    this._isAlive = false;
    this._revokedAt = new Date();
  }

  renew(newTokenHash: string, newExpiredAt: Date): void {
    if (!this._isAlive) {
      throw new RefreshTokenRevokedError();
    }
    if (this.checkIsExpired()) {
      throw new RefreshTokenExpiredError();
    }
    this._previousTokenHash = this._currentTokenHash;
    this._currentTokenHash = newTokenHash;
    this._expiredAt = newExpiredAt;
  }
}
