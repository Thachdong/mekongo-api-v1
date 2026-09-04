import { Profile } from '../../domain/profile.entity';

export interface IProfileRepository {
  create(profile: Profile): Promise<Profile>;
  findAllByAccountId(accountId: string): Promise<Profile[]>;
  findById(id: string): Promise<Profile | null>;
  findByIds(ids: string[]): Promise<Profile[]>;
}
