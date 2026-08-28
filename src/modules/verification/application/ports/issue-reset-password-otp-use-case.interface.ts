export type TIssueResetPasswordOtpInput = {
  accountId: string;
  identifier: string;
};

export type TIssueResetPasswordOtpOutput = {
  otpId: string;
  expiredAt: Date;
};

export interface IIssueResetPasswordOtpUseCase {
  execute(
    input: TIssueResetPasswordOtpInput,
  ): Promise<TIssueResetPasswordOtpOutput>;
}
