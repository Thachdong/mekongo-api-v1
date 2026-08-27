import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOtpRepository } from '../../application/ports/otp-repository.interface';
import { Otp } from '../../domain/otp.entity';
import { OtpMapper } from './mappers/otp.mapper';
import { OtpTypeOrmEntity } from './entities/otp.typeorm-entity';

@Injectable()
export class TypeOrmOtpRepository implements IOtpRepository {
  constructor(
    @InjectRepository(OtpTypeOrmEntity)
    private readonly _repository: Repository<OtpTypeOrmEntity>,
  ) {}

  async create(otp: Otp): Promise<Otp> {
    const entity = OtpMapper.toPersistence(otp);
    const saved = await this._repository.save(entity);
    return OtpMapper.toDomain(saved);
  }
}
