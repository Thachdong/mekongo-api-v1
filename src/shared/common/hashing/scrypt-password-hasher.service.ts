import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { IPasswordHasher } from './password-hasher.interface';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/**
 * Password hashing: salted + slow KDF (scrypt) — one-way, non-deterministic,
 * verify-only. Never used for equality lookups.
 */
@Injectable()
export class ScryptPasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(plain, salt, KEY_LENGTH)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    const [salt, key] = hashed.split(':');
    if (!salt || !key) {
      return false;
    }

    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = (await scryptAsync(plain, salt, KEY_LENGTH)) as Buffer;

    return (
      keyBuffer.length === derivedKey.length &&
      timingSafeEqual(keyBuffer, derivedKey)
    );
  }
}
