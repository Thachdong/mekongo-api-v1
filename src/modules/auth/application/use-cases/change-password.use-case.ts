import { Inject, Injectable } from '@nestjs/common';
import {
  type IChangeAccountPasswordUseCase,
  CHANGE_ACCOUNT_PASSWORD_USECASE,
} from '@modules/account/public-api';
import {
  type IVerifyOtpUseCase,
  VERIFY_OTP_USECASE,
} from '@modules/verification/public-api';
import { PASSWORD_HASHER } from '@shared/common/hashing/hashing.tokens';
import { IPasswordHasher } from '@shared/common/hashing/password-hasher.interface';

export type TAuthChangePasswordInput = {
  identifier: string;
  code: string;
  password: string;
};

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(VERIFY_OTP_USECASE)
    private readonly _verifyOtpUseCase: IVerifyOtpUseCase,
    @Inject(CHANGE_ACCOUNT_PASSWORD_USECASE)
    private readonly _changeAccountPasswordUseCase: IChangeAccountPasswordUseCase,
    @Inject(PASSWORD_HASHER)
    private readonly _passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: TAuthChangePasswordInput): Promise<void> {
    const { accountId } = await this._verifyOtpUseCase.execute({
      identifier: input.identifier,
      code: input.code,
      purpose: 'RESET_PASSWORD',
    });

    const passwordHash = await this._passwordHasher.hash(input.password);

    await this._changeAccountPasswordUseCase.execute({
      accountId,
      passwordHash,
    });
  }
}
