import { writeFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { dump } from 'js-yaml';
import { AppModule } from '../../../app.module';
import { buildSwaggerConfig } from './swagger.config';

async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());

  const outputPath = join(process.cwd(), 'openapi.yml');
  writeFileSync(outputPath, dump(document));

  await app.close();
  // eslint-disable-next-line no-console
  console.log(`openapi.yml generated at ${outputPath}`);
  process.exit(0);
}

generate();
