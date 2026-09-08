import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '@modules/account/account.module';
import { VerificationModule } from '@modules/verification/verification.module';
import { WsAuthModule } from '@shared/websocket/ws-auth.module';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { ActivateUseCase } from './application/use-cases/activate.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { IssueWsTokenUseCase } from './application/use-cases/issue-ws-token.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { AuthController } from './infrastructure/http/auth.controller';
import {
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_ISSUER,
} from './application/ports/auth-application.tokens';
import { JwtTokenIssuer } from './infrastructure/jwt/jwt-token-issuer.service';
import { RefreshTokenTypeOrmEntity } from './infrastructure/typeorm/entities/refresh-token.typeorm-entity';
import { TypeOrmRefreshTokenRepository } from './infrastructure/typeorm/refresh-token.repository';
import { LogoutUseCase } from './application/use-cases/logout.use-case';

@Module({
  imports: [
    AccountModule,
    VerificationModule,
    WsAuthModule,
    TypeOrmModule.forFeature([RefreshTokenTypeOrmEntity]),
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
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    ActivateUseCase,
    ResetPasswordUseCase,
    ChangePasswordUseCase,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    IssueWsTokenUseCase,
    {
      provide: TOKEN_ISSUER,
      useClass: JwtTokenIssuer,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: TypeOrmRefreshTokenRepository,
    },
  ],
})
export class AuthModule {}
