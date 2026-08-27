import { registerAs } from '@nestjs/config';

export type TLoggerConfig = {
  level: string;
  dir: string;
  file: string;
};

export const loggerConfig = registerAs('logger', (): TLoggerConfig => ({
  level:
    process.env.LOG_LEVEL ??
    (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  dir: process.env.LOG_DIR ?? './logs',
  file: process.env.LOG_FILE ?? 'app.log',
}));
