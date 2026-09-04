import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  ICommentRepository,
  TFindRootByPostIdResult,
} from '../../application/ports/comment-repository.interface';
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

  async findRootByPostId(
    postId: string,
    page: number,
    limit: number,
  ): Promise<TFindRootByPostIdResult> {
    const [entities, total] = await this._repository.findAndCount({
      where: { postId, parentId: IsNull() },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items: entities.map(CommentMapper.toDomain), total };
  }

  async countChildrenByParentIds(
    parentIds: string[],
  ): Promise<Record<string, number>> {
    if (parentIds.length === 0) {
      return {};
    }

    const rows = await this._repository
      .createQueryBuilder('comment')
      .select('comment.parent_id', 'parentId')
      .addSelect('COUNT(*)', 'count')
      .where('comment.parent_id IN (:...parentIds)', { parentIds })
      .groupBy('comment.parent_id')
      .getRawMany<{ parentId: string; count: string }>();

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.parentId] = Number(row.count);
      return acc;
    }, {});
  }

  async findDirectChildren(parentId: string): Promise<Comment[]> {
    const entities = await this._repository.find({
      where: { parentId },
      order: { createdAt: 'ASC' },
    });
    return entities.map(CommentMapper.toDomain);
  }
}
