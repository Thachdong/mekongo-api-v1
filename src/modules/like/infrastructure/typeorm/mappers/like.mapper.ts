import { Like } from '../../../domain/like.entity';
import { TReactionType } from '../../../domain/value-objects/reaction-type.enum';
import { LikeTypeOrmEntity } from '../entities/like.typeorm-entity';

export class LikeMapper {
  static toDomain(entity: LikeTypeOrmEntity): Like {
    return new Like({
      id: entity.id,
      postId: entity.postId,
      profileId: entity.profileId,
      reactionType: entity.reactionType as TReactionType,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(like: Like): LikeTypeOrmEntity {
    const entity = new LikeTypeOrmEntity();
    if (like.id) {
      entity.id = like.id;
    }
    entity.postId = like.postId;
    entity.profileId = like.profileId;
    entity.reactionType = like.reactionType;
    return entity;
  }
}
