import { Post } from '../../../domain/post.entity';
import { PostTypeOrmEntity } from '../entities/post.typeorm-entity';

export class PostMapper {
  static toDomain(entity: PostTypeOrmEntity): Post {
    return new Post({
      id: entity.id,
      postType: entity.postType,
      title: entity.title,
      content: entity.content,
      images: entity.images,
      provinceCode: entity.provinceCode,
      profileId: entity.profileId,
      likeCount: entity.likeCount,
      commentCount: entity.commentCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(post: Post): PostTypeOrmEntity {
    const entity = new PostTypeOrmEntity();
    if (post.id) {
      entity.id = post.id;
    }
    entity.postType = post.postType;
    entity.title = post.title;
    entity.content = post.content;
    entity.images = post.images;
    entity.provinceCode = post.provinceCode;
    entity.profileId = post.profileId;
    entity.likeCount = post.likeCount;
    entity.commentCount = post.commentCount;
    return entity;
  }
}
