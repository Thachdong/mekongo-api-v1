import { Inject, Injectable } from '@nestjs/common';
import {
  FIND_PROFILES_BY_IDS_USECASE,
  IFindProfilesByIdsUseCase,
} from '@modules/account/public-api';
import { Notification } from '../../domain/notification.entity';
import { TNotificationActor } from '../ports/get-notifications-use-case.interface';

@Injectable()
export class ResolveNotificationActorsService {
  constructor(
    @Inject(FIND_PROFILES_BY_IDS_USECASE)
    private readonly _findProfilesByIdsUseCase: IFindProfilesByIdsUseCase,
  ) {}

  async execute(
    notifications: Notification[],
  ): Promise<Map<string, TNotificationActor>> {
    const profileIds = [...new Set(notifications.map((n) => n.actorProfileId))];
    const profiles = await this._findProfilesByIdsUseCase.execute({
      profileIds,
    });

    const actorByProfileId = new Map<string, TNotificationActor>();
    for (const profile of profiles) {
      actorByProfileId.set(profile.id as string, {
        profileId: profile.id as string,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      });
    }

    return actorByProfileId;
  }
}
