import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  OTP_REPOSITORY,
  OTP_SENDER,
  VERIFY_OTP_USECASE,
} from './application/ports/verification-application.tokens';
import { IssueAccountVerificationUseCase } from './application/use-cases/issue-account-verification.use-case';
import { VerifyOtpUseCase } from './application/use-cases/verify-otp.use-case';
import { ReSendOtpUseCase } from './application/use-cases/re-send-otp.use-case';
import { ISSUE_ACCOUNT_VERIFICATION_USECASE } from './public-api';
import { ConsoleOtpSender } from './infrastructure/console/console-otp-sender.service';
import { EmailOtpSenderService } from './infrastructure/console/email-otp-sender.service';
import { PhoneOtpSenderService } from './infrastructure/console/phone-otp-sender.service';
import { OtpTypeOrmEntity } from './infrastructure/typeorm/entities/otp.typeorm-entity';
import { TypeOrmOtpRepository } from './infrastructure/typeorm/otp.repository';
import { VerificationController } from './infrastructure/http/verification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OtpTypeOrmEntity])],
  controllers: [VerificationController],
  providers: [
    IssueAccountVerificationUseCase,
    {
      provide: ISSUE_ACCOUNT_VERIFICATION_USECASE,
      useExisting: IssueAccountVerificationUseCase,
    },
    VerifyOtpUseCase,
    {
      provide: VERIFY_OTP_USECASE,
      useExisting: VerifyOtpUseCase,
    },
    ReSendOtpUseCase,
    EmailOtpSenderService,
    PhoneOtpSenderService,
    { provide: OTP_REPOSITORY, useClass: TypeOrmOtpRepository },
    { provide: OTP_SENDER, useClass: ConsoleOtpSender },
  ],
  exports: [ISSUE_ACCOUNT_VERIFICATION_USECASE, VERIFY_OTP_USECASE],
})
export class VerificationModule {}
