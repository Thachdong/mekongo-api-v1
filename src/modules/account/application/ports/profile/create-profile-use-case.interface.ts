import { Profile } from '../../../domain/profile.entity';
import { TProfileType } from '../../../domain/value-objects/profile-type.enum';

export type TCreateProfileInput = {
  accountId: string;
  profileType: TProfileType;
};

export interface ICreateProfileUseCase {
  execute(input: TCreateProfileInput): Promise<Profile>;
}
