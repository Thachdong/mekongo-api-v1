import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IAddressRepository } from '../../application/ports/address-repository.interface';
import { Address } from '../../domain/address.entity';
import { AddressMapper } from './address.mapper';
import { AddressTypeOrmEntity } from './entities/address.typeorm-entity';
import { transactionContext } from './transaction-context';

@Injectable()
export class TypeOrmAddressRepository implements IAddressRepository {
  constructor(
    @InjectRepository(AddressTypeOrmEntity)
    private readonly _repository: Repository<AddressTypeOrmEntity>,
  ) {}

  private get _manager(): EntityManager {
    return transactionContext.getStore() ?? this._repository.manager;
  }

  async create(address: Address): Promise<Address> {
    const entity = AddressMapper.toPersistence(address);
    const saved = await this._manager
      .getRepository(AddressTypeOrmEntity)
      .save(entity);
    return AddressMapper.toDomain(saved);
  }
}
