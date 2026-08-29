import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TAccountLoginType } from '../../../domain/value-objects/account-login-type.enum';
import { TAccountStatus } from '../../../domain/value-objects/account-status.enum';

@Entity('accounts')
export class AccountTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'login_type', type: 'varchar' })
  loginType: TAccountLoginType;

  @Column({ name: 'identifier_hash', type: 'varchar', unique: true })
  identifierHash: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar' })
  status: TAccountStatus;

  @Column({ name: 'block_until', type: 'timestamptz', nullable: true })
  blockUntil: Date | null;

  @Column({ name: 'display_name', type: 'varchar' })
  displayName: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'current_address_id', type: 'uuid', nullable: true })
  currentAddressId: string | null;

  @Column({ name: 'active_profile_id', type: 'uuid', nullable: true })
  activeProfileId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
