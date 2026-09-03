import { DomainError } from '@shared/kernel/errors/domain-error';

export class CurrentAddressNotFoundError extends DomainError {
  constructor() {
    super(
      'CURRENT_ADDRESS_NOT_FOUND',
      404,
      'Tài khoản chưa có địa chỉ hiện tại',
    );
  }
}
