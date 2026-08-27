import { Otp } from '../../../domain/otp.entity';
import { OtpTypeOrmEntity } from '../entities/otp.typeorm-entity';

export class OtpMapper {
  static toDomain(entity: OtpTypeOrmEntity): Otp {
    return new Otp({
      id: entity.id,
      purpose: entity.purpose,
      identifier: entity.identifier,
      accountId: entity.accountId,
      codeHash: entity.codeHash,
      expiredAt: entity.expiredAt,
      retryCount: entity.retryCount,
      wrongCount: entity.wrongCount,
      blockType: entity.blockType,
      blockUntil: entity.blockUntil,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(otp: Otp): OtpTypeOrmEntity {
    const entity = new OtpTypeOrmEntity();
    if (otp.id) {
      entity.id = otp.id;
    }
    entity.purpose = otp.purpose;
    entity.identifier = otp.identifier;
    entity.accountId = otp.accountId;
    entity.codeHash = otp.codeHash;
    entity.expiredAt = otp.expiredAt;
    entity.retryCount = otp.getRetryCount();
    entity.blockType = otp.blockType;
    entity.blockUntil = otp.blockUntil;
    return entity;
  }
}
