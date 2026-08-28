import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IAccountRepository } from '../../application/ports/account-repository.interface';
import { Account } from '../../domain/account.entity';
import { AccountTypeOrmEntity } from './entities/account.typeorm-entity';
import { transactionContext } from './transaction-context';
import { AccountMapper } from './mappers/account.mapper';

@Injectable()
export class TypeOrmAccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(AccountTypeOrmEntity)
    private readonly _repository: Repository<AccountTypeOrmEntity>,
  ) {}

  private get _manager(): EntityManager {
    return transactionContext.getStore() ?? this._repository.manager;
  }

  async create(account: Account): Promise<Account> {
    const entity = AccountMapper.toPersistence(account);
    const saved = await this._manager
      .getRepository(AccountTypeOrmEntity)
      .save(entity);
    return AccountMapper.toDomain(saved);
  }

  async update(account: Account): Promise<Account> {
    const entity = AccountMapper.toPersistence(account);
    const saved = await this._manager
      .getRepository(AccountTypeOrmEntity)
      .save(entity);
    return AccountMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Account | null> {
    const entity = await this._manager
      .getRepository(AccountTypeOrmEntity)
      .findOne({ where: { id } });
    return entity ? AccountMapper.toDomain(entity) : null;
  }
}
