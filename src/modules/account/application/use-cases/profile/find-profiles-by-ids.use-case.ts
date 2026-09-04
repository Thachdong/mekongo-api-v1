import { Inject, Injectable } from '@nestjs/common';
import { Profile } from '../../../domain/profile.entity';
import { PROFILE_REPOSITORY } from '../../ports/account-application.tokens';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import {
  IFindProfilesByIdsUseCase,
  TFindProfilesByIdsInput,
} from '../../ports/profile/find-profiles-by-ids-use-case.interface';

@Injectable()
export class FindProfilesByIdsUseCase implements IFindProfilesByIdsUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly _profileRepository: IProfileRepository,
  ) {}

  async execute(input: TFindProfilesByIdsInput): Promise<Profile[]> {
    return this._profileRepository.findByIds(input.profileIds);
  }
}
