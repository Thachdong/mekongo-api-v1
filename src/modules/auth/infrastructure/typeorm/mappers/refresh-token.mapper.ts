import { RefreshToken } from '../../../domain/refresh-token.entity';
import { RefreshTokenTypeOrmEntity } from '../entities/refresh-token.typeorm-entity';

export class RefreshTokenMapper {
  static toDomain(entity: RefreshTokenTypeOrmEntity): RefreshToken {
    return new RefreshToken({
      id: entity.id,
      accountId: entity.accountId,
      currentTokenHash: entity.currentTokenHash,
      previousTokenHash: entity.previousTokenHash,
      expiredAt: entity.expiredAt,
      revokedAt: entity.revokedAt,
      isAlive: entity.isAlive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(refreshToken: RefreshToken): RefreshTokenTypeOrmEntity {
    const entity = new RefreshTokenTypeOrmEntity();
    if (refreshToken.id) {
      entity.id = refreshToken.id;
    }
    entity.accountId = refreshToken.accountId;
    entity.currentTokenHash = refreshToken.currentTokenHash;
    entity.previousTokenHash = refreshToken.previousTokenHash;
    entity.expiredAt = refreshToken.expiredAt;
    entity.revokedAt = refreshToken.revokedAt;
    entity.isAlive = refreshToken.isAlive;
    return entity;
  }
}
