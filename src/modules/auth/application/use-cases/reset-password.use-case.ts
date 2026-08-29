import { Inject, Injectable } from '@nestjs/common';
import {
  type IFindAccountByIdentifierUseCase,
  FIND_ACCOUNT_BY_IDENTIFIER_USECASE,
} from '@modules/account/public-api';
import {
  type IIssueResetPasswordOtpUseCase,
  ISSUE_RESET_PASSWORD_OTP_USECASE,
} from '@modules/verification/public-api';

export type TAuthResetPasswordInput = {
  identifier: string;
};

export type TAuthResetPasswordOutput = {
  otpId: string;
  otpExpiredAt: Date;
};

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(FIND_ACCOUNT_BY_IDENTIFIER_USECASE)
    private readonly _findAccountByIdentifierUseCase: IFindAccountByIdentifierUseCase,
    @Inject(ISSUE_RESET_PASSWORD_OTP_USECASE)
    private readonly _issueResetPasswordOtpUseCase: IIssueResetPasswordOtpUseCase,
  ) {}

  async execute(
    input: TAuthResetPasswordInput,
  ): Promise<TAuthResetPasswordOutput> {
    const { account } = await this._findAccountByIdentifierUseCase.execute({
      identifier: input.identifier,
    });

    const { otpId, expiredAt } =
      await this._issueResetPasswordOtpUseCase.execute({
        accountId: account.id,
        identifier: input.identifier,
      });

    return { otpId, otpExpiredAt: expiredAt };
  }
}
