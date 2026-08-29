import { DomainError } from '@shared/kernel/errors/domain-error';

export class InvalidOtpCodeError extends DomainError {
  constructor() {
    super('OTP_CODE_INVALID', 400, 'OTP code is invalid');
  }
}
