import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommentRepository } from '../../application/ports/comment-repository.interface';
import { Comment } from '../../domain/comment.entity';
import { CommentTypeOrmEntity } from './entities/comment.typeorm-entity';
import { CommentMapper } from './mappers/comment.mapper';

@Injectable()
export class TypeOrmCommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(CommentTypeOrmEntity)
    private readonly _repository: Repository<CommentTypeOrmEntity>,
  ) {}

  async create(comment: Comment): Promise<Comment> {
    const entity = CommentMapper.toPersistence(comment);
    const saved = await this._repository.save(entity);
    return CommentMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Comment | null> {
    const entity = await this._repository.findOne({ where: { id } });
    return entity ? CommentMapper.toDomain(entity) : null;
  }

  async update(comment: Comment): Promise<Comment> {
    const entity = CommentMapper.toPersistence(comment);
    const saved = await this._repository.save(entity);
    return CommentMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this._repository.softDelete({ id });
  }

  async hasChildren(commentId: string): Promise<boolean> {
    const count = await this._repository.count({
      where: { parentId: commentId },
    });
    return count > 0;
  }
}
