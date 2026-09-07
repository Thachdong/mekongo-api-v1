import { Account } from '@modules/account/domain/account.entity';
import { AccountTypeOrmEntity } from '../entities/account.typeorm-entity';

export class AccountMapper {
  static toDomain(entity: AccountTypeOrmEntity): Account {
    return new Account({
      id: entity.id,
      loginType: entity.loginType,
      identifierHash: entity.identifierHash,
      passwordHash: entity.passwordHash,
      status: entity.status,
      blockUntil: entity.blockUntil,
      displayName: entity.displayName,
      avatarUrl: entity.avatarUrl,
      activeProfileId: entity.activeProfileId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(account: Account): AccountTypeOrmEntity {
    const entity = new AccountTypeOrmEntity();
    if (account.id) {
      entity.id = account.id;
    }
    entity.loginType = account.loginType;
    entity.identifierHash = account.identifierHash;
    entity.passwordHash = account.passwordHash;
    entity.status = account.status;
    entity.blockUntil = account.blockUntil;
    entity.displayName = account.displayName;
    entity.avatarUrl = account.avatarUrl;
    entity.activeProfileId = account.activeProfileId;
    return entity;
  }
}
