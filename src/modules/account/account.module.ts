import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ACCOUNT_REPOSITORY,
  ADDRESS_REPOSITORY,
  PROFILE_REPOSITORY,
  TRANSACTION_MANAGER,
} from './application/ports/account-application.tokens';
import { RegisterAccountUseCase } from './application/use-cases/register-account.use-case';
import { AccountTypeOrmEntity } from './infrastructure/typeorm/entities/account.typeorm-entity';
import { TypeOrmAccountRepository } from './infrastructure/typeorm/account.repository';
import { AddressTypeOrmEntity } from './infrastructure/typeorm/entities/address.typeorm-entity';
import { TypeOrmAddressRepository } from './infrastructure/typeorm/address.repository';
import { ProfileTypeOrmEntity } from './infrastructure/typeorm/entities/profile.typeorm-entity';
import { TypeOrmProfileRepository } from './infrastructure/typeorm/profile.repository';
import { TypeOrmTransactionManager } from './infrastructure/typeorm/typeorm-transaction-manager.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountTypeOrmEntity,
      AddressTypeOrmEntity,
      ProfileTypeOrmEntity,
    ]),
  ],
  providers: [
    RegisterAccountUseCase,
    { provide: ACCOUNT_REPOSITORY, useClass: TypeOrmAccountRepository },
    { provide: ADDRESS_REPOSITORY, useClass: TypeOrmAddressRepository },
    { provide: PROFILE_REPOSITORY, useClass: TypeOrmProfileRepository },
    { provide: TRANSACTION_MANAGER, useClass: TypeOrmTransactionManager },
  ],
  exports: [RegisterAccountUseCase],
})
export class AccountModule {}
