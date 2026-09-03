import { Profile } from '../../../domain/profile.entity';

export type TGetAccountProfilesInput = {
  accountId: string;
};

export interface IGetAccountProfilesUseCase {
  execute(input: TGetAccountProfilesInput): Promise<Profile[]>;
}
