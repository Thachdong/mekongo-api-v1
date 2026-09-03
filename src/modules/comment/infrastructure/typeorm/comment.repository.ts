import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ICommentRepository } from '../../application/ports/comment-repository.interface';
import { Comment } from '../../domain/comment.entity';
import { CommentTypeOrmEntity } from './entities/comment.typeorm-entity';
import { CommentMapper } from './mappers/comment.mapper';
import { transactionContext } from './transaction-context';

@Injectable()
export class TypeOrmCommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(CommentTypeOrmEntity)
    private readonly _repository: Repository<CommentTypeOrmEntity>,
  ) {}

  private get _manager(): EntityManager {
    return transactionContext.getStore() ?? this._repository.manager;
  }

  async create(comment: Comment): Promise<Comment> {
    const entity = CommentMapper.toPersistence(comment);
    const saved = await this._manager
      .getRepository(CommentTypeOrmEntity)
      .save(entity);
    return CommentMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Comment | null> {
    const entity = await this._manager
      .getRepository(CommentTypeOrmEntity)
      .findOne({ where: { id } });
    return entity ? CommentMapper.toDomain(entity) : null;
  }

  async update(comment: Comment): Promise<Comment> {
    const entity = CommentMapper.toPersistence(comment);
    const saved = await this._manager
      .getRepository(CommentTypeOrmEntity)
      .save(entity);
    return CommentMapper.toDomain(saved);
  }
}
