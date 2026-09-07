import { DomainError } from '@shared/kernel/errors/domain-error';

export class AddressAssignedToProfileError extends DomainError {
  constructor() {
    super(
      'ADDRESS_ASSIGNED_TO_PROFILE',
      409,
      'Address đang được gán cho 1 profile, không thể xoá',
    );
  }
}
