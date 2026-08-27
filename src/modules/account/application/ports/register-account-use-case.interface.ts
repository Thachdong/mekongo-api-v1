import { Account } from '../../domain/account.entity';
import { Address } from '../../domain/address.entity';
import { Profile } from '../../domain/profile.entity';
import { TAccountLoginType } from '../../domain/value-objects/account-login-type.enum';
import { TProfileType } from '../../domain/value-objects/profile-type.enum';

export type TRegisterAccountInput = {
  loginType: TAccountLoginType;
  identifierHash: string;
  passwordHash: string;
  displayName: string;
  avatarUrl: string | null;
  address: {
    label: string;
    province: string;
    provinceCode: number;
    ward: string;
    details: string;
  };
  profileType: TProfileType;
};

export type TRegisterAccountOutput = {
  account: Account;
  address: Address;
  profile: Profile;
};

export interface IRegisterAccountUseCase {
  execute(input: TRegisterAccountInput): Promise<TRegisterAccountOutput>;
}
