import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IAddressRepository } from '../../application/ports/address/address-repository.interface';
import { Address } from '../../domain/address.entity';
import { AddressTypeOrmEntity } from './entities/address.typeorm-entity';
import { transactionContext } from './transaction-context';
import { AddressMapper } from './mappers/address.mapper';

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

  async findAllByAccountId(accountId: string): Promise<Address[]> {
    const entities = await this._manager
      .getRepository(AddressTypeOrmEntity)
      .find({ where: { accountId } });
    return entities.map(AddressMapper.toDomain);
  }

  async findById(id: string): Promise<Address | null> {
    const entity = await this._manager
      .getRepository(AddressTypeOrmEntity)
      .findOne({ where: { id } });
    return entity ? AddressMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this._manager.getRepository(AddressTypeOrmEntity).delete({ id });
  }
}
