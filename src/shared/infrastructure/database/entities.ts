import { AccountTypeOrmEntity } from '@modules/account/infrastructure/typeorm/entities/account.typeorm-entity';
import { AddressTypeOrmEntity } from '@modules/account/infrastructure/typeorm/entities/address.typeorm-entity';
import { ProfileTypeOrmEntity } from '@modules/account/infrastructure/typeorm/entities/profile.typeorm-entity';
import { OtpTypeOrmEntity } from '@modules/verification/infrastructure/typeorm/entities/otp.typeorm-entity';
import { EntitySchema } from 'typeorm';

type TEntityClass = new (...args: any[]) => object;

/**
 * Explicit entity registry — no glob/file-pattern loading.
 * Each module registers its own entity class here by import, e.g.:
 *   import { AccountEntity } from '@modules/account/infrastructure/typeorm/account.entity';
 */
export const ENTITIES: (TEntityClass | EntitySchema)[] = [
  AccountTypeOrmEntity,
  AddressTypeOrmEntity,
  ProfileTypeOrmEntity,
  OtpTypeOrmEntity,
];
