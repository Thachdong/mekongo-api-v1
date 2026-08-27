import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Params } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { TLoggerConfig } from '@config/logger.config';

export function buildPinoParams(configService: ConfigService): Params {
  const { level, dir, file } =
    configService.getOrThrow<TLoggerConfig>('logger');
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    return {
      pinoHttp: {
        level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:standard',
          },
        },
      },
    };
  }

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  return {
    pinoHttp: {
      level,
      transport: {
        target: 'pino/file',
        options: {
          destination: join(dir, file),
          mkdir: true,
        },
      },
    },
  };
}
