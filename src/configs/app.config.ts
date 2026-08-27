import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: process.env.APP_PORT ?? 3000,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  apiPrefix: process.env.API_PREFIX,
}));
