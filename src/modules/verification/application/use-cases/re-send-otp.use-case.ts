import { randomInt } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TOtpConfig } from '@config/otp.config';
import { OTP_HASHER } from '@shared/common/hashing/hashing.tokens';
import { IKeyedHasher } from '@shared/common/hashing/keyed-hasher.interface';
import { Otp } from '../../domain/otp.entity';
import { OtpNotFoundError } from '../../domain/errors/otp-not-found.error';
import { OtpBlockedError } from '../../domain/errors/otp-blocked.error';
import { OtpNotExpiredError } from '../../domain/errors/otp-not-expired.error';
import { OtpAlreadyConsumedError } from '../../domain/errors/otp-already-consumed.error';
import {
  IReSendOtpUseCase,
  TReSendOtpInput,
  TReSendOtpOutput,
} from '../ports/re-send-otp-use-case.interface';
import { IOtpRepository } from '../ports/otp-repository.interface';
import { IOtpSender } from '../ports/otp-sender.interface';
import {
  OTP_REPOSITORY,
  OTP_SENDER,
} from '../ports/verification-application.tokens';

@Injectable()
export class ReSendOtpUseCase implements IReSendOtpUseCase {
  constructor(
    @Inject(OTP_REPOSITORY)
    private readonly _otpRepository: IOtpRepository,
    @Inject(OTP_SENDER)
    private readonly _otpSender: IOtpSender,
    @Inject(OTP_HASHER)
    private readonly _otpHasher: IKeyedHasher,
    private readonly _configService: ConfigService,
  ) {}

  async execute(input: TReSendOtpInput): Promise<TReSendOtpOutput> {
    const lastOtp = await this._otpRepository.findLatestByIdentifier(
      input.identifier,
      input.purpose,
    );

    if (!lastOtp) {
      throw new OtpNotFoundError();
    }

    if (lastOtp.isConsumed) {
      throw new OtpAlreadyConsumedError();
    }

    const blockState = lastOtp.checkIsBlocked();
    if (blockState) {
      throw new OtpBlockedError(blockState.blockUntil);
    }

    if (!lastOtp.checkIsExpired()) {
      throw new OtpNotExpiredError();
    }

    const otpConfig = this._configService.getOrThrow<TOtpConfig>('otp');

    const code = randomInt(0, 10 ** otpConfig.codeLength)
      .toString()
      .padStart(otpConfig.codeLength, '0');
    const codeHash = this._otpHasher.hash(code);
    const expiredAt = new Date(
      Date.now() + otpConfig.expireMinutes * 60 * 1000,
    );

    const newOtp = await this._otpRepository.create(
      new Otp({
        id: null,
        purpose: input.purpose,
        identifier: lastOtp.identifier,
        accountId: lastOtp.accountId,
        codeHash,
        expiredAt,
        retryCount: lastOtp.getRetryCount() + 1,
        wrongCount: 0,
        blockType: null,
        blockUntil: null,
        isConsumed: false,
        createdAt: null,
        updatedAt: null,
      }),
    );

    await this._otpSender.send({
      identifier: lastOtp.identifier,
      code,
      purpose: input.purpose,
    });

    return { otpId: newOtp.id as string, expiredAt: newOtp.expiredAt };
  }
}
