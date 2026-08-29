import { DomainError } from '@shared/kernel/errors/domain-error';

export class OtpNotFoundError extends DomainError {
  constructor() {
    super('OTP_NOT_FOUND', 404, 'OTP not found');
  }
}
