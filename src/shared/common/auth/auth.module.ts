import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshAccessStrategy } from './jwt-refresh-access.strategy';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessTokenSecret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessTokenExpiredIn'),
        },
      }),
    }),
  ],
  providers: [
    JwtAccessStrategy,
    JwtAuthGuard,
    JwtRefreshAccessStrategy,
    JwtRefreshAuthGuard,
  ],
  exports: [PassportModule, JwtModule, JwtAuthGuard, JwtRefreshAuthGuard],
})
export class AuthPassportModule {}
