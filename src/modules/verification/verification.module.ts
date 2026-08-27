import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  OTP_REPOSITORY,
  OTP_SENDER,
} from './application/ports/verification-application.tokens';
import { IssueAccountVerificationUseCase } from './application/use-cases/issue-account-verification.use-case';
import { ConsoleOtpSender } from './infrastructure/console/console-otp-sender.service';
import { EmailOtpSenderService } from './infrastructure/console/email-otp-sender.service';
import { PhoneOtpSenderService } from './infrastructure/console/phone-otp-sender.service';
import { OtpTypeOrmEntity } from './infrastructure/typeorm/entities/otp.typeorm-entity';
import { TypeOrmOtpRepository } from './infrastructure/typeorm/otp.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OtpTypeOrmEntity])],
  providers: [
    IssueAccountVerificationUseCase,
    EmailOtpSenderService,
    PhoneOtpSenderService,
    { provide: OTP_REPOSITORY, useClass: TypeOrmOtpRepository },
    { provide: OTP_SENDER, useClass: ConsoleOtpSender },
  ],
  exports: [IssueAccountVerificationUseCase],
})
export class VerificationModule {}
