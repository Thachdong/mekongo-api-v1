import { Inject, Injectable } from '@nestjs/common';
import {
  type IActivateAccountUseCase,
  ACTIVATE_ACCOUNT_USECASE,
} from '@modules/account/public-api';
import {
  type IVerifyOtpUseCase,
  VERIFY_OTP_USECASE,
} from '@modules/verification/public-api';

export type TAuthActivateInput = {
  identifier: string;
  code: string;
};

@Injectable()
export class ActivateUseCase {
  constructor(
    @Inject(VERIFY_OTP_USECASE)
    private readonly _verifyOtpUseCase: IVerifyOtpUseCase,
    @Inject(ACTIVATE_ACCOUNT_USECASE)
    private readonly _activateAccountUseCase: IActivateAccountUseCase,
  ) {}

  async execute(input: TAuthActivateInput): Promise<void> {
    const { accountId } = await this._verifyOtpUseCase.execute({
      identifier: input.identifier,
      code: input.code,
      purpose: 'ACCOUNT_VERIFICATION',
    });

    await this._activateAccountUseCase.execute({ accountId });
  }
}
