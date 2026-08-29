import { Address } from '@modules/account/domain/address.entity';
import { AddressTypeOrmEntity } from '../entities/address.typeorm-entity';

export class AddressMapper {
  static toDomain(entity: AddressTypeOrmEntity): Address {
    return new Address({
      id: entity.id,
      label: entity.label,
      province: entity.province,
      provinceCode: entity.provinceCode,
      ward: entity.ward,
      details: entity.details,
      accountId: entity.accountId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(address: Address): AddressTypeOrmEntity {
    const entity = new AddressTypeOrmEntity();
    if (address.id) {
      entity.id = address.id;
    }
    entity.label = address.label;
    entity.province = address.province;
    entity.provinceCode = address.provinceCode;
    entity.ward = address.ward;
    entity.details = address.details;
    entity.accountId = address.accountId;
    return entity;
  }
}
