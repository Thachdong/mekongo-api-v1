import { registerAs } from '@nestjs/config';

export const dbConfig = registerAs('db', () => ({
  postgresHost: process.env.POSTGRES_HOST ?? 'localhost',
  postgresPort: Number(process.env.POSTGRES_PORT ?? 5432),
  postgresUser: process.env.POSTGRES_USER ?? 'mekongo',
  postgresPassword: process.env.POSTGRES_PASSWORD ?? 'mekongo',
  postgresDb: process.env.POSTGRES_DATABASE ?? 'mekongo',
}));
