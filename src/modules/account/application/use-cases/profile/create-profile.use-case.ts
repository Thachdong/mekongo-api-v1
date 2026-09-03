import { Inject, Injectable } from '@nestjs/common';
import { Profile } from '../../../domain/profile.entity';
import { DuplicateProfileTypeError } from '../../../domain/errors/duplicate-profile-type.error';
import { MaxProfileLimitReachedError } from '../../../domain/errors/max-profile-limit-reached.error';
import { PROFILE_REPOSITORY } from '../../ports/account-application.tokens';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import {
  ICreateProfileUseCase,
  TCreateProfileInput,
} from '../../ports/profile/create-profile-use-case.interface';

const MAX_PROFILE_COUNT = 3;

@Injectable()
export class CreateProfileUseCase implements ICreateProfileUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly _profileRepository: IProfileRepository,
  ) {}

  async execute(input: TCreateProfileInput): Promise<Profile> {
    const existingProfiles = await this._profileRepository.findAllByAccountId(
      input.accountId,
    );

    if (existingProfiles.length >= MAX_PROFILE_COUNT) {
      throw new MaxProfileLimitReachedError();
    }

    const isDuplicate = existingProfiles.some(
      (profile) => profile.activeProfile === input.profileType,
    );
    if (isDuplicate) {
      throw new DuplicateProfileTypeError();
    }

    return this._profileRepository.create(
      new Profile({
        id: null,
        activeProfile: input.profileType,
        accountId: input.accountId,
        createdAt: null,
        updatedAt: null,
      }),
    );
  }
}
