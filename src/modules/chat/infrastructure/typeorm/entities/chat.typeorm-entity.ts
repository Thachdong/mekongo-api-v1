import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('chats')
@Index(['postId', 'buyerProfileId'])
export class ChatTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id', type: 'uuid' })
  postId: string;

  @Column({ name: 'owner_profile_id', type: 'uuid' })
  ownerProfileId: string;

  @Column({ name: 'buyer_profile_id', type: 'uuid' })
  buyerProfileId: string;

  @Column({ name: 'sender_profile_id', type: 'uuid' })
  senderProfileId: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
