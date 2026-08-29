export type TIssueAccountVerificationInput = {
  accountId: string;
  identifier: string;
};

export type TIssueAccountVerificationOutput = {
  otpId: string;
  expiredAt: Date;
};

export interface IIssueAccountVerificationUseCase {
  execute(
    input: TIssueAccountVerificationInput,
  ): Promise<TIssueAccountVerificationOutput>;
}
