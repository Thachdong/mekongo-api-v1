import { randomInt } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TOtpConfig } from '@config/otp.config';
import { OTP_HASHER } from '@shared/common/hashing/hashing.tokens';
import { IKeyedHasher } from '@shared/common/hashing/keyed-hasher.interface';
import { Otp } from '../../domain/otp.entity';
import {
  IIssueResetPasswordOtpUseCase,
  TIssueResetPasswordOtpInput,
  TIssueResetPasswordOtpOutput,
} from '../ports/issue-reset-password-otp-use-case.interface';
import { IOtpRepository } from '../ports/otp-repository.interface';
import { IOtpSender } from '../ports/otp-sender.interface';
import {
  OTP_REPOSITORY,
  OTP_SENDER,
} from '../ports/verification-application.tokens';

@Injectable()
export class IssueResetPasswordOtpUseCase implements IIssueResetPasswordOtpUseCase {
  constructor(
    @Inject(OTP_REPOSITORY)
    private readonly _otpRepository: IOtpRepository,
    @Inject(OTP_SENDER)
    private readonly _otpSender: IOtpSender,
    @Inject(OTP_HASHER)
    private readonly _otpHasher: IKeyedHasher,
    private readonly _configService: ConfigService,
  ) {}

  async execute(
    input: TIssueResetPasswordOtpInput,
  ): Promise<TIssueResetPasswordOtpOutput> {
    const otpConfig = this._configService.getOrThrow<TOtpConfig>('otp');

    const code = randomInt(0, 10 ** otpConfig.codeLength)
      .toString()
      .padStart(otpConfig.codeLength, '0');
    const codeHash = this._otpHasher.hash(code);
    const expiredAt = new Date(
      Date.now() + otpConfig.expireMinutes * 60 * 1000,
    );

    const otp = await this._otpRepository.create(
      new Otp({
        id: null,
        purpose: 'RESET_PASSWORD',
        identifier: input.identifier,
        accountId: input.accountId,
        codeHash,
        expiredAt,
        retryCount: 0,
        wrongCount: 0,
        blockType: null,
        blockUntil: null,
        isConsumed: false,
        createdAt: null,
        updatedAt: null,
      }),
    );

    await this._otpSender.send({
      identifier: input.identifier,
      code,
      purpose: 'RESET_PASSWORD',
    });

    return { otpId: otp.id as string, expiredAt: otp.expiredAt };
  }
}
