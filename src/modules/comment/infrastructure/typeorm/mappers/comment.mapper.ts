import { Comment } from '../../../domain/comment.entity';
import { CommentTypeOrmEntity } from '../entities/comment.typeorm-entity';

export class CommentMapper {
  static toDomain(entity: CommentTypeOrmEntity): Comment {
    return new Comment({
      id: entity.id,
      content: entity.content,
      parentId: entity.parentId,
      postId: entity.postId,
      profileId: entity.profileId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(comment: Comment): CommentTypeOrmEntity {
    const entity = new CommentTypeOrmEntity();
    if (comment.id) {
      entity.id = comment.id;
    }
    entity.content = comment.content;
    entity.parentId = comment.parentId;
    entity.postId = comment.postId;
    entity.profileId = comment.profileId;
    return entity;
  }
}
