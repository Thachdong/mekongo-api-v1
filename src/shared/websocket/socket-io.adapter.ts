import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { TAppConfig } from '@config/app.config';

export class ConfigSocketIoAdapter extends IoAdapter {
  constructor(private readonly _app: INestApplicationContext) {
    super(_app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const { corsOrigin } = this._app
      .get(ConfigService)
      .getOrThrow<TAppConfig>('app');

    return super.createIOServer(port, {
      ...options,
      cors: { origin: corsOrigin },
    });
  }
}
