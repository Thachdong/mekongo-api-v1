import { DomainError } from '@shared/kernel/errors/domain-error';

export class InvalidProfileAddressInputError extends DomainError {
  constructor() {
    super(
      'INVALID_PROFILE_ADDRESS_INPUT',
      400,
      'Phải cung cấp đúng 1 trong 2: addressId hoặc newAddress khi tạo profile',
    );
  }
}
