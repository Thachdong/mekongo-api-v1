import { Inject, Injectable } from '@nestjs/common';
import {
  FIND_PROFILES_BY_IDS_USECASE,
  IFindProfilesByIdsUseCase,
} from '@modules/account/public-api';
import { TChatParticipant } from '../ports/get-chat-rooms-use-case.interface';

@Injectable()
export class ResolveChatParticipantsService {
  constructor(
    @Inject(FIND_PROFILES_BY_IDS_USECASE)
    private readonly _findProfilesByIdsUseCase: IFindProfilesByIdsUseCase,
  ) {}

  async execute(profileIds: string[]): Promise<Map<string, TChatParticipant>> {
    const uniqueProfileIds = [...new Set(profileIds)];
    const profiles = await this._findProfilesByIdsUseCase.execute({
      profileIds: uniqueProfileIds,
    });

    const participantByProfileId = new Map<string, TChatParticipant>();
    for (const profile of profiles) {
      participantByProfileId.set(profile.id as string, {
        profileId: profile.id as string,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      });
    }

    return participantByProfileId;
  }
}
