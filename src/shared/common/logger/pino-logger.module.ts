import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { buildPinoParams } from './pino-options.factory';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildPinoParams,
    }),
  ],
  exports: [LoggerModule],
})
export class PinoLoggerModule {}
