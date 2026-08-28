export type TVerifyOtpInput = {
  identifier: string;
  code: string;
};

export type TVerifyOtpOutput = {
  accountId: string;
};

export interface IVerifyOtpUseCase {
  execute(input: TVerifyOtpInput): Promise<TVerifyOtpOutput>;
}
