import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ENTITIES } from './entities';

/**
 * Standalone DataSource for the TypeORM CLI (migration:generate/run/revert).
 * Deliberately independent of Nest's DI/ConfigModule — the CLI runs outside
 * an application bootstrap, so config is read directly from process.env.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'mekongo',
  password: process.env.POSTGRES_PASSWORD ?? 'mekongo',
  database: process.env.POSTGRES_DATABASE ?? 'mekongo',
  entities: ENTITIES,
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
