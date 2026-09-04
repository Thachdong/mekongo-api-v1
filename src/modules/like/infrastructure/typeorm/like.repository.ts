import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILikeRepository } from '../../application/ports/like-repository.interface';
import { Like } from '../../domain/like.entity';
import { LikeTypeOrmEntity } from './entities/like.typeorm-entity';
import { LikeMapper } from './mappers/like.mapper';

@Injectable()
export class TypeOrmLikeRepository implements ILikeRepository {
  constructor(
    @InjectRepository(LikeTypeOrmEntity)
    private readonly _repository: Repository<LikeTypeOrmEntity>,
  ) {}

  async create(like: Like): Promise<Like> {
    const entity = LikeMapper.toPersistence(like);
    const saved = await this._repository.save(entity);
    return LikeMapper.toDomain(saved);
  }

  async findByPostAndProfile(
    postId: string,
    profileId: string,
  ): Promise<Like | null> {
    const entity = await this._repository.findOne({
      where: { postId, profileId },
    });
    return entity ? LikeMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this._repository.delete({ id });
  }
}
