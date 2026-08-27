import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { buildSwaggerConfig } from './swagger.config';

export function setupSwagger(app: INestApplication): void {
  const enabled = process.env.SWAGGER_ENABLED !== 'false';
  if (!enabled) {
    return;
  }

  const path = process.env.SWAGGER_PATH ?? 'docs';
  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());

  SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
