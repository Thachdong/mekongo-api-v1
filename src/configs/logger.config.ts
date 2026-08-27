import { registerAs } from '@nestjs/config';

export const loggerConfig = registerAs('logger', () => ({
  level: process.env.LOG_LEVEL,
  dir: process.env.LOG_DIR,
  file: process.env.LOG_FILE,
}));
