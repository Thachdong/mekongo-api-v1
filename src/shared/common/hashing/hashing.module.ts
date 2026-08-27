import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HmacKeyedHasher } from './hmac-keyed-hasher.service';
import { ScryptPasswordHasher } from './scrypt-password-hasher.service';
import {
  IDENTIFIER_HASHER,
  OTP_HASHER,
  PASSWORD_HASHER,
} from './hashing.tokens';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PASSWORD_HASHER,
      useClass: ScryptPasswordHasher,
    },
    {
      provide: IDENTIFIER_HASHER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new HmacKeyedHasher(
          configService.get<string>('HASH_PEPPER', 'dev-pepper-change-me'),
          'identifier',
        ),
    },
    {
      provide: OTP_HASHER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new HmacKeyedHasher(
          configService.get<string>('HASH_PEPPER', 'dev-pepper-change-me'),
          'otp',
        ),
    },
  ],
  exports: [PASSWORD_HASHER, IDENTIFIER_HASHER, OTP_HASHER],
})
export class HashingModule {}
