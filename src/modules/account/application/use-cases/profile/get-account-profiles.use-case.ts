import { Inject, Injectable } from '@nestjs/common';
import { Profile } from '../../../domain/profile.entity';
import { PROFILE_REPOSITORY } from '../../ports/account-application.tokens';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import {
  IGetAccountProfilesUseCase,
  TGetAccountProfilesInput,
} from '../../ports/profile/get-account-profiles-use-case.interface';

@Injectable()
export class GetAccountProfilesUseCase implements IGetAccountProfilesUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly _profileRepository: IProfileRepository,
  ) {}

  async execute(input: TGetAccountProfilesInput): Promise<Profile[]> {
    return this._profileRepository.findAllByAccountId(input.accountId);
  }
}
