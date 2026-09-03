import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IProfileRepository } from '../../application/ports/profile-repository.interface';
import { Profile } from '../../domain/profile.entity';
import { ProfileMapper } from './mappers/profile.mapper';
import { ProfileTypeOrmEntity } from './entities/profile.typeorm-entity';
import { transactionContext } from './transaction-context';

@Injectable()
export class TypeOrmProfileRepository implements IProfileRepository {
  constructor(
    @InjectRepository(ProfileTypeOrmEntity)
    private readonly _repository: Repository<ProfileTypeOrmEntity>,
  ) {}

  private get _manager(): EntityManager {
    return transactionContext.getStore() ?? this._repository.manager;
  }

  async create(profile: Profile): Promise<Profile> {
    const entity = ProfileMapper.toPersistence(profile);
    const saved = await this._manager
      .getRepository(ProfileTypeOrmEntity)
      .save(entity);
    return ProfileMapper.toDomain(saved);
  }

  async findAllByAccountId(accountId: string): Promise<Profile[]> {
    const entities = await this._manager
      .getRepository(ProfileTypeOrmEntity)
      .find({ where: { accountId } });
    return entities.map(ProfileMapper.toDomain);
  }

  async findById(id: string): Promise<Profile | null> {
    const entity = await this._manager
      .getRepository(ProfileTypeOrmEntity)
      .findOne({ where: { id } });
    return entity ? ProfileMapper.toDomain(entity) : null;
  }
}
