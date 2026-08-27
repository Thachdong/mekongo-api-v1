import { registerAs } from '@nestjs/config';

export type TAppConfig = {
  port: number;
  corsOrigin: string;
  apiPrefix?: string;
};

export const appConfig = registerAs('app', (): TAppConfig => ({
  port: Number(process.env.APP_PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  apiPrefix: process.env.API_PREFIX,
}));
