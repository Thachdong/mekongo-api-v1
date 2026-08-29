import { DomainError } from '@shared/kernel/errors/domain-error';

export class OtpAlreadyConsumedError extends DomainError {
  constructor() {
    super(
      'OTP_ALREADY_CONSUMED',
      400,
      'No pending OTP action, please request a new OTP',
    );
  }
}
