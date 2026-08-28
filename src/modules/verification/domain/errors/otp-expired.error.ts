import { DomainError } from '@shared/kernel/errors/domain-error';

export class OtpExpiredError extends DomainError {
  constructor() {
    super('OTP_EXPIRED', 400, 'OTP is expired');
  }
}
