import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPostRepository } from '../../application/ports/post-repository.interface';
import { Post } from '../../domain/post.entity';
import { PostTypeOrmEntity } from './entities/post.typeorm-entity';
import { PostMapper } from './mappers/post.mapper';

@Injectable()
export class TypeOrmPostRepository implements IPostRepository {
  constructor(
    @InjectRepository(PostTypeOrmEntity)
    private readonly _repository: Repository<PostTypeOrmEntity>,
  ) {}

  async create(post: Post): Promise<Post> {
    const entity = PostMapper.toPersistence(post);
    const saved = await this._repository.save(entity);
    return PostMapper.toDomain(saved);
  }
}
