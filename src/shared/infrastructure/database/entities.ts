import { EntitySchema } from 'typeorm';

type TEntityClass = new (...args: any[]) => object;

/**
 * Explicit entity registry — no glob/file-pattern loading.
 * Each module registers its own entity class here by import, e.g.:
 *   import { AccountEntity } from '@modules/account/infrastructure/typeorm/account.entity';
 */
export const ENTITIES: (TEntityClass | EntitySchema)[] = [];
