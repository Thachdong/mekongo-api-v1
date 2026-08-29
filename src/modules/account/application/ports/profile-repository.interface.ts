import { Profile } from '../../domain/profile.entity';

export interface IProfileRepository {
  create(profile: Profile): Promise<Profile>;
}
