import { Chat } from '../../../domain/chat.entity';
import { ChatTypeOrmEntity } from '../entities/chat.typeorm-entity';

export class ChatMapper {
  static toDomain(entity: ChatTypeOrmEntity): Chat {
    return new Chat({
      id: entity.id,
      postId: entity.postId,
      ownerProfileId: entity.ownerProfileId,
      buyerProfileId: entity.buyerProfileId,
      senderProfileId: entity.senderProfileId,
      content: entity.content,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(chat: Chat): ChatTypeOrmEntity {
    const entity = new ChatTypeOrmEntity();
    if (chat.id) {
      entity.id = chat.id;
    }
    entity.postId = chat.postId;
    entity.ownerProfileId = chat.ownerProfileId;
    entity.buyerProfileId = chat.buyerProfileId;
    entity.senderProfileId = chat.senderProfileId;
    entity.content = chat.content;
    return entity;
  }
}
