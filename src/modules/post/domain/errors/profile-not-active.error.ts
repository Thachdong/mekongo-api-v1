import { DomainError } from '@shared/kernel/errors/domain-error';

export class ProfileNotActiveError extends DomainError {
  constructor() {
    super('PROFILE_NOT_ACTIVE', 422, 'Tài khoản chưa chọn hồ sơ hoạt động');
  }
}
