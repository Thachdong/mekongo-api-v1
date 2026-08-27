import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { TAppConfig } from '@config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const { port, corsOrigin, apiPrefix } =
    configService.getOrThrow<TAppConfig>('app');

  app.enableCors({ origin: corsOrigin });
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  await app.listen(port);
}
bootstrap();
