export type TReSendOtpInput = {
  identifier: string;
};

export type TReSendOtpOutput = {
  otpId: string;
  expiredAt: Date;
};

export interface IReSendOtpUseCase {
  execute(input: TReSendOtpInput): Promise<TReSendOtpOutput>;
}
