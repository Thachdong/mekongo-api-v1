import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'current_token_hash', type: 'varchar' })
  currentTokenHash: string;

  @Column({ name: 'previous_token_hash', type: 'varchar', nullable: true })
  previousTokenHash: string | null;

  @Column({ name: 'expired_at', type: 'timestamptz' })
  expiredAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'is_alive', type: 'boolean', default: true })
  isAlive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
