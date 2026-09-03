import { DomainError } from '@shared/kernel/errors/domain-error';

export class AddressNotFoundError extends DomainError {
  constructor() {
    super('ADDRESS_NOT_FOUND', 404, 'Address not found');
  }
}
