import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TProfileType } from '../../../domain/value-objects/profile-type.enum';

@Entity('profiles')
export class ProfileTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'active_profile', type: 'varchar' })
  activeProfile: TProfileType;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
