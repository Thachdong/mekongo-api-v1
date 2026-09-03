import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '@config/app.config';
import { dbConfig } from '@config/db.config';
import { jwtConfig } from '@config/jwt.config';
import { firebaseConfig } from '@config/firebase.config';
import { loggerConfig } from '@config/logger.config';
import { otpConfig } from '@config/otp.config';
import { validationSchema } from '@config/validation.schema';
import { GlobalExceptionFilter } from '@shared/common/filters/global-exception.filter';
import { ResponseInterceptor } from '@shared/common/interceptors/response.interceptor';
import { PinoLoggerModule } from '@shared/common/logger/pino-logger.module';
import { SharedTypeOrmModule } from '@shared/infrastructure/database/typeorm.module';
import { HashingModule } from '@shared/common/hashing/hashing.module';
import { AuthPassportModule } from '@shared/common/auth/auth.module';
import { VerificationModule } from './modules/verification/verification.module';
import { StorageModule } from '@shared/infrastructure/storage/storage.module';
import { PostModule } from './modules/post/post.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        appConfig,
        dbConfig,
        jwtConfig,
        firebaseConfig,
        loggerConfig,
        otpConfig,
      ],
      isGlobal: true,
      validationSchema: validationSchema,
    }),
    PinoLoggerModule,
    SharedTypeOrmModule,
    StorageModule,
    HashingModule,
    AuthPassportModule,
    AccountModule,
    AuthModule,
    VerificationModule,
    PostModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
  ],
})
export class AppModule {}
