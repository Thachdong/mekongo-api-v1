import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INotificationRepository } from '../../application/ports/notification-repository.interface';
import { Notification } from '../../domain/notification.entity';
import { NotificationTypeOrmEntity } from './entities/notification.typeorm-entity';
import { NotificationMapper } from './mappers/notification.mapper';

@Injectable()
export class TypeOrmNotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationTypeOrmEntity)
    private readonly _repository: Repository<NotificationTypeOrmEntity>,
  ) {}

  async create(notification: Notification): Promise<Notification> {
    const entity = NotificationMapper.toPersistence(notification);
    const saved = await this._repository.save(entity);
    return NotificationMapper.toDomain(saved);
  }

  async findByProfileId(
    profileId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Notification[]; total: number }> {
    const [rows, total] = await this._repository.findAndCount({
      where: { recipientProfileId: profileId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items: rows.map(NotificationMapper.toDomain), total };
  }

  async countUnread(profileId: string): Promise<number> {
    return this._repository.count({
      where: { recipientProfileId: profileId, isRead: false },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    const entity = await this._repository.findOne({ where: { id } });
    return entity ? NotificationMapper.toDomain(entity) : null;
  }

  async markAsRead(notification: Notification): Promise<void> {
    await this._repository.update(
      { id: notification.id as string },
      { isRead: true },
    );
  }

  async markAllAsRead(profileId: string): Promise<void> {
    await this._repository.update(
      { recipientProfileId: profileId, isRead: false },
      { isRead: true },
    );
  }
}
