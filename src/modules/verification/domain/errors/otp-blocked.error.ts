import { DomainError } from '@shared/kernel/errors/domain-error';

export class OtpBlockedError extends DomainError {
  constructor(blockUntil: Date) {
    super('OTP_BLOCKED', 403, 'OTP is blocked', { blockUntil });
  }
}
