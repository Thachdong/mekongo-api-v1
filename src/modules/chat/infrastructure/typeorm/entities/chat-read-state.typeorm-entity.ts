import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chat_read_states')
@Index(['postId', 'buyerProfileId', 'profileId'], { unique: true })
export class ChatReadStateTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id', type: 'uuid' })
  postId: string;

  @Column({ name: 'buyer_profile_id', type: 'uuid' })
  buyerProfileId: string;

  @Column({ name: 'profile_id', type: 'uuid' })
  profileId: string;

  @Column({ name: 'last_read_at', type: 'timestamptz', nullable: true })
  lastReadAt: Date | null;
}
