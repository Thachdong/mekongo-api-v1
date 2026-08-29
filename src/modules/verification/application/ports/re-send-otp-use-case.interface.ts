import { TOtpPurpose } from '../../domain/value-objects/otp-purpose.enum';

export type TReSendOtpInput = {
  identifier: string;
  purpose: TOtpPurpose;
};

export type TReSendOtpOutput = {
  otpId: string;
  expiredAt: Date;
};

export interface IReSendOtpUseCase {
  execute(input: TReSendOtpInput): Promise<TReSendOtpOutput>;
}
