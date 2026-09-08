import { Profile } from '../../../domain/profile.entity';
import { TProfileType } from '../../../domain/value-objects/profile-type.enum';

export type TCreateProfileInput = {
  accountId: string;
  profileType: TProfileType;
  addressId?: string;
  newAddress?: {
    label: string;
    province: string;
    provinceCode: number;
    ward: string;
    details: string;
  };
};

export interface ICreateProfileUseCase {
  execute(input: TCreateProfileInput): Promise<Profile>;
}
