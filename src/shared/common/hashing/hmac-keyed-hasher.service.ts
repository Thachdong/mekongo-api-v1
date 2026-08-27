import { createHmac, timingSafeEqual } from 'crypto';
import { IKeyedHasher } from './keyed-hasher.interface';

/**
 * Deterministic keyed hash (HMAC-SHA256) for values that must stay
 * equality-lookupable (identifier, OTP) — not for passwords.
 * `_purpose` domain-separates the derived key so an identifier hash and an
 * OTP hash of the same plaintext never collide.
 */
export class HmacKeyedHasher implements IKeyedHasher {
  constructor(
    private readonly _secret: string,
    private readonly _purpose: string,
  ) {}

  hash(value: string): string {
    return this._derive(value).toString('hex');
  }

  verify(value: string, hashed: string): boolean {
    const expected = this._derive(value);
    const actual = Buffer.from(hashed, 'hex');

    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }

  private _derive(value: string): Buffer {
    return createHmac('sha256', `${this._secret}:${this._purpose}`)
      .update(value)
      .digest();
  }
}
