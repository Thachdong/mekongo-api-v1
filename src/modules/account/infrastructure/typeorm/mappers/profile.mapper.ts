import { Profile } from '@modules/account/domain/profile.entity';
import { ProfileTypeOrmEntity } from '../entities/profile.typeorm-entity';

export class ProfileMapper {
  static toDomain(entity: ProfileTypeOrmEntity): Profile {
    return new Profile({
      id: entity.id,
      activeProfile: entity.activeProfile,
      accountId: entity.accountId,
      displayName: entity.displayName,
      avatarUrl: entity.avatarUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(profile: Profile): ProfileTypeOrmEntity {
    const entity = new ProfileTypeOrmEntity();
    if (profile.id) {
      entity.id = profile.id;
    }
    entity.activeProfile = profile.activeProfile;
    entity.accountId = profile.accountId;
    entity.displayName = profile.displayName;
    entity.avatarUrl = profile.avatarUrl;
    return entity;
  }
}
