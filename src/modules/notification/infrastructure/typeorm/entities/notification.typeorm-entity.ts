import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
@Index(['recipientProfileId', 'isRead'])
export class NotificationTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipient_profile_id', type: 'uuid' })
  recipientProfileId: string;

  @Column({ name: 'actor_profile_id', type: 'uuid' })
  actorProfileId: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ name: 'post_id', type: 'uuid' })
  postId: string;

  @Column({ name: 'comment_id', type: 'uuid' })
  commentId: string;

  @Column({ name: 'content_preview', type: 'text' })
  contentPreview: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
