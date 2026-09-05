import { ChatReadState } from '../../../domain/chat-read-state.entity';
import { ChatReadStateTypeOrmEntity } from '../entities/chat-read-state.typeorm-entity';

export class ChatReadStateMapper {
  static toDomain(entity: ChatReadStateTypeOrmEntity): ChatReadState {
    return new ChatReadState({
      id: entity.id,
      postId: entity.postId,
      buyerProfileId: entity.buyerProfileId,
      profileId: entity.profileId,
      lastReadAt: entity.lastReadAt,
    });
  }

  static toPersistence(readState: ChatReadState): ChatReadStateTypeOrmEntity {
    const entity = new ChatReadStateTypeOrmEntity();
    if (readState.id) {
      entity.id = readState.id;
    }
    entity.postId = readState.postId;
    entity.buyerProfileId = readState.buyerProfileId;
    entity.profileId = readState.profileId;
    entity.lastReadAt = readState.lastReadAt;
    return entity;
  }
}
