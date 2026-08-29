import { AsyncLocalStorage } from 'node:async_hooks';
import { EntityManager } from 'typeorm';

export const transactionContext = new AsyncLocalStorage<EntityManager>();
