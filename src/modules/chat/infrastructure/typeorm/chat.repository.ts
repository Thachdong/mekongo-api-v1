import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IChatRepository,
  TChatRoomSummary,
} from '../../application/ports/chat-repository.interface';
import { Chat } from '../../domain/chat.entity';
import { ChatReadStateTypeOrmEntity } from './entities/chat-read-state.typeorm-entity';
import { ChatTypeOrmEntity } from './entities/chat.typeorm-entity';
import { ChatMapper } from './mappers/chat.mapper';

@Injectable()
export class TypeOrmChatRepository implements IChatRepository {
  constructor(
    @InjectRepository(ChatTypeOrmEntity)
    private readonly _repository: Repository<ChatTypeOrmEntity>,
    @InjectRepository(ChatReadStateTypeOrmEntity)
    private readonly _readStateRepository: Repository<ChatReadStateTypeOrmEntity>,
  ) {}

  async create(chat: Chat): Promise<Chat> {
    const entity = ChatMapper.toPersistence(chat);
    const saved = await this._repository.save(entity);
    return ChatMapper.toDomain(saved);
  }

  async findRoomsByProfileId(profileId: string): Promise<TChatRoomSummary[]> {
    const rows = await this._repository
      .createQueryBuilder('chat')
      .distinctOn(['chat.postId', 'chat.buyerProfileId'])
      .where('chat.ownerProfileId = :profileId', { profileId })
      .orWhere('chat.buyerProfileId = :profileId', { profileId })
      .orderBy('chat.postId', 'ASC')
      .addOrderBy('chat.buyerProfileId', 'ASC')
      .addOrderBy('chat.createdAt', 'DESC')
      .getMany();

    return rows
      .map((row) => ({
        postId: row.postId,
        ownerProfileId: row.ownerProfileId,
        buyerProfileId: row.buyerProfileId,
        lastMessageContent: row.content,
        lastMessageAt: row.createdAt,
      }))
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async findMessages(
    postId: string,
    buyerProfileId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Chat[]; total: number }> {
    const [rows, total] = await this._repository.findAndCount({
      where: { postId, buyerProfileId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items: rows.map(ChatMapper.toDomain), total };
  }

  async upsertReadState(
    profileId: string,
    postId: string,
    buyerProfileId: string,
    readAt: Date,
  ): Promise<void> {
    await this._readStateRepository
      .createQueryBuilder()
      .insert()
      .into(ChatReadStateTypeOrmEntity)
      .values({ postId, buyerProfileId, profileId, lastReadAt: readAt })
      .orUpdate(['last_read_at'], ['post_id', 'buyer_profile_id', 'profile_id'])
      .execute();
  }

  async countUnreadRooms(profileId: string): Promise<number> {
    const { count } = await this._repository
      .createQueryBuilder('chat')
      .leftJoin(
        ChatReadStateTypeOrmEntity,
        'read_state',
        'read_state.postId = chat.postId AND read_state.buyerProfileId = chat.buyerProfileId AND read_state.profileId = :profileId',
        { profileId },
      )
      .where(
        '(chat.ownerProfileId = :profileId OR chat.buyerProfileId = :profileId)',
        { profileId },
      )
      .andWhere('chat.senderProfileId != :profileId', { profileId })
      .andWhere(
        '(read_state.lastReadAt IS NULL OR chat.createdAt > read_state.lastReadAt)',
      )
      .select('COUNT(DISTINCT (chat.postId, chat.buyerProfileId))', 'count')
      .getRawOne<{ count: string }>();

    return Number(count ?? 0);
  }
}
