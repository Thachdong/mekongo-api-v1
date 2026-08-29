import { DomainError } from '@shared/kernel/errors/domain-error';

export class OtpNotExpiredError extends DomainError {
  constructor() {
    super('OTP_NOT_EXPIRED', 400, 'OTP is still valid, cannot resend yet');
  }
}
