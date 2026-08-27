import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessTokenExpiredIn: process.env.ACCESS_TOKEN_EXPIRED_IN ?? '15m',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTkenExpiredIn: process.env.REFRESH_TOKEN_EXPIRED_IN ?? '7d',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
}));
