import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IChatRepository,
  TChatRoomSummary,
} from '../../application/ports/chat-repository.interface';
import { Chat } from '../../domain/chat.entity';
import { ChatTypeOrmEntity } from './entities/chat.typeorm-entity';
import { ChatMapper } from './mappers/chat.mapper';

@Injectable()
export class TypeOrmChatRepository implements IChatRepository {
  constructor(
    @InjectRepository(ChatTypeOrmEntity)
    private readonly _repository: Repository<ChatTypeOrmEntity>,
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
}
