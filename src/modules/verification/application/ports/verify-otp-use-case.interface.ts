import { TOtpPurpose } from '../../domain/value-objects/otp-purpose.enum';

export type TVerifyOtpInput = {
  identifier: string;
  code: string;
  purpose: TOtpPurpose;
};

export type TVerifyOtpOutput = {
  accountId: string;
};

export interface IVerifyOtpUseCase {
  execute(input: TVerifyOtpInput): Promise<TVerifyOtpOutput>;
}
