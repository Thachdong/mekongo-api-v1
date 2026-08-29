import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRefreshTokenRepository } from '../../application/ports/refresh-token-repository.interface';
import { RefreshToken } from '../../domain/refresh-token.entity';
import { RefreshTokenMapper } from './mappers/refresh-token.mapper';
import { RefreshTokenTypeOrmEntity } from './entities/refresh-token.typeorm-entity';

@Injectable()
export class TypeOrmRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenTypeOrmEntity)
    private readonly _repository: Repository<RefreshTokenTypeOrmEntity>,
  ) {}

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const entity = RefreshTokenMapper.toPersistence(refreshToken);
    const saved = await this._repository.save(entity);
    return RefreshTokenMapper.toDomain(saved);
  }
}
