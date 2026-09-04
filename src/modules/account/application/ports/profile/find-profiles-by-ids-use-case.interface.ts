import { Profile } from '../../../domain/profile.entity';

export type TFindProfilesByIdsInput = {
  profileIds: string[];
};

export interface IFindProfilesByIdsUseCase {
  execute(input: TFindProfilesByIdsInput): Promise<Profile[]>;
}
