import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ENTITIES } from './entities';

export const buildTypeOrmOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('db.postgresHost'),
  port: configService.get<number>('db.postgresPort'),
  username: configService.get<string>('db.postgresUser'),
  password: configService.get<string>('db.postgresPassword'),
  database: configService.get<string>('db.postgresDb'),
  entities: ENTITIES,
  autoLoadEntities: true,
  synchronize: false,
  migrationsRun: false,
});
