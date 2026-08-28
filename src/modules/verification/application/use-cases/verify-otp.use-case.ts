import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TOtpConfig } from '@config/otp.config';
import { OTP_HASHER } from '@shared/common/hashing/hashing.tokens';
import { IKeyedHasher } from '@shared/common/hashing/keyed-hasher.interface';
import { OtpNotFoundError } from '../../domain/errors/otp-not-found.error';
import { OtpBlockedError } from '../../domain/errors/otp-blocked.error';
import { OtpExpiredError } from '../../domain/errors/otp-expired.error';
import { InvalidOtpCodeError } from '../../domain/errors/invalid-otp-code.error';
import { OtpAlreadyConsumedError } from '../../domain/errors/otp-already-consumed.error';
import {
  IVerifyOtpUseCase,
  TVerifyOtpInput,
  TVerifyOtpOutput,
} from '../ports/verify-otp-use-case.interface';
import { IOtpRepository } from '../ports/otp-repository.interface';
import { OTP_REPOSITORY } from '../ports/verification-application.tokens';

@Injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    @Inject(OTP_REPOSITORY)
    private readonly _otpRepository: IOtpRepository,
    @Inject(OTP_HASHER)
    private readonly _otpHasher: IKeyedHasher,
    private readonly _configService: ConfigService,
  ) {}

  async execute(input: TVerifyOtpInput): Promise<TVerifyOtpOutput> {
    const otp = await this._otpRepository.findLatestByIdentifier(
      input.identifier,
      input.purpose,
    );

    if (!otp) {
      throw new OtpNotFoundError();
    }

    if (otp.isConsumed) {
      throw new OtpAlreadyConsumedError();
    }

    const blockState = otp.checkIsBlocked();
    if (blockState) {
      throw new OtpBlockedError(blockState.blockUntil);
    }

    if (otp.checkIsExpired()) {
      throw new OtpExpiredError();
    }

    const codeHash = this._otpHasher.hash(input.code);
    const isMatch = otp.compareCodeHash(codeHash);

    if (!isMatch) {
      const otpConfig = this._configService.getOrThrow<TOtpConfig>('otp');
      const newBlockState = otp.registerWrongAttempt(
        otpConfig.maxWrongCount,
        otpConfig.blockDurationMinutes * 60 * 1000,
      );
      await this._otpRepository.update(otp);
      if (newBlockState) {
        throw new OtpBlockedError(newBlockState.blockUntil);
      }
      throw new InvalidOtpCodeError();
    }

    otp.markConsumed();
    await this._otpRepository.update(otp);

    return { accountId: otp.accountId };
  }
}
