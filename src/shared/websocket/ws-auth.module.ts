import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WS_JWT_SERVICE } from './ws-jwt.tokens';

@Module({
  providers: [
    {
      provide: WS_JWT_SERVICE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtService =>
        new JwtService({
          secret: configService.get<string>('jwt.wsTokenSecret'),
          signOptions: {
            expiresIn: configService.get<string>('jwt.wsTokenExpiredIn'),
          },
        }),
    },
  ],
  exports: [WS_JWT_SERVICE],
})
export class WsAuthModule {}
