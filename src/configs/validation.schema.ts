import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // APP CONFIG
  APP_PORT: Joi.number().default(3000),
  CORS_ORIGIN: Joi.string().default('*'),
  API_PREFIX: Joi.string().default('/api'),

  //  DB CONFIG
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_USER: Joi.string().default('mekongo'),
  POSTGRES_PASSWORD: Joi.string().default('mekongo'),
  POSTGRES_DATABASE: Joi.string().default('mekongo'),

  // JWT CONFIG
  ACCESS_TOKEN_EXPIRED_IN: Joi.string().default('15m'),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRED_IN: Joi.string().default('7d'),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  WS_TOKEN_EXPIRED_IN: Joi.string().default('15m'),
  WS_TOKEN_SECRET: Joi.string().required(),

  // OTP CONFIG
  OTP_CODE_LENGTH: Joi.number().default(6),
  OTP_EXPIRE_MINUTES: Joi.number().default(5),

  // COMMENT CONFIG
  COMMENT_LEVEL_LIMIT: Joi.number().default(3),

  //  FIREBASE CONFIG
  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),
  FIREBASE_STORAGE_BUCKET: Joi.string().required(),
  FIREBASE_UPLOAD_URL_TTL_MS: Joi.number().default(900000),
  FIREBASE_DOWNLOAD_URL_TTL_MS: Joi.number().default(3600000),

  //  LOGGER CONFIG
  LOG_LEVEL: Joi.string().default(
    process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  ),
  LOG_DIR: Joi.string().default('./logs'),
  LOG_FILE: Joi.string().default('app.log'),

  //  SWAGGER CONFIG
  SWAGGER_ENABLED: Joi.boolean().default(process.env.NODE_ENV !== 'production'),
  SWAGGER_PATH: Joi.string().default('docs'),
});
