import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TOtpBlockType } from '../../../domain/value-objects/otp-block-type.enum';
import { TOtpPurpose } from '../../../domain/value-objects/otp-purpose.enum';

@Entity('otps')
export class OtpTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  purpose: TOtpPurpose;

  @Column({ type: 'varchar' })
  identifier: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'code_hash', type: 'varchar' })
  codeHash: string;

  @Column({ name: 'expired_at', type: 'timestamptz' })
  expiredAt: Date;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'wrong_count', type: 'int', default: 0 })
  wrongCount: number;

  @Column({ name: 'block_type', type: 'varchar', nullable: true })
  blockType: TOtpBlockType | null;

  @Column({ name: 'block_until', type: 'timestamptz', nullable: true })
  blockUntil: Date | null;

  @Column({ name: 'is_consumed', type: 'boolean', default: false })
  isConsumed: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
