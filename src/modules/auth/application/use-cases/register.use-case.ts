import { Inject, Injectable } from '@nestjs/common';
import {
  type IRegisterAccountUseCase,
  REGISTER_ACCOUNT_USECASE,
  type TRegisterAccountInput,
} from '@modules/account/public-api';
import {
  type IIssueAccountVerificationUseCase,
  ISSUE_ACCOUNT_VERIFICATION_USECASE,
} from '@modules/verification/public-api';
import {
  IDENTIFIER_HASHER,
  PASSWORD_HASHER,
} from '@shared/common/hashing/hashing.tokens';
import { IKeyedHasher } from '@shared/common/hashing/keyed-hasher.interface';
import { IPasswordHasher } from '@shared/common/hashing/password-hasher.interface';

export type TAuthRegisterInput = {
  loginType: TRegisterAccountInput['loginType'];
  identifier: string;
  password: string;
  displayName: string;
  avatarUrl: string | null;
  address: TRegisterAccountInput['address'];
  profileType: TRegisterAccountInput['profileType'];
};

export type TAuthRegisterOutput = {
  accountId: string;
  otpId: string;
  otpExpiredAt: Date;
};

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(REGISTER_ACCOUNT_USECASE)
    private readonly _registerAccountUseCase: IRegisterAccountUseCase,
    @Inject(ISSUE_ACCOUNT_VERIFICATION_USECASE)
    private readonly _issueAccountVerificationUseCase: IIssueAccountVerificationUseCase,
    @Inject(PASSWORD_HASHER)
    private readonly _passwordHasher: IPasswordHasher,
    @Inject(IDENTIFIER_HASHER)
    private readonly _identifierHasher: IKeyedHasher,
  ) {}

  async execute(input: TAuthRegisterInput): Promise<TAuthRegisterOutput> {
    const identifierHash = this._identifierHasher.hash(input.identifier);
    const passwordHash = await this._passwordHasher.hash(input.password);

    const { account } = await this._registerAccountUseCase.execute({
      loginType: input.loginType,
      identifierHash,
      passwordHash,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
      address: input.address,
      profileType: input.profileType,
    });

    const { otpId, expiredAt } =
      await this._issueAccountVerificationUseCase.execute({
        accountId: account.id as string,
        identifier: input.identifier,
      });

    return {
      accountId: account.id as string,
      otpId,
      otpExpiredAt: expiredAt,
    };
  }
}
