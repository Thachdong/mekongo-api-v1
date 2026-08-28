import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ACCOUNT_REPOSITORY,
  ACTIVATE_ACCOUNT_USECASE,
  ADDRESS_REPOSITORY,
  FIND_ACCOUNT_BY_IDENTIFIER_USECASE,
  PROFILE_REPOSITORY,
  REGISTER_ACCOUNT_USECASE,
  TRANSACTION_MANAGER,
} from './application/ports/account-application.tokens';
import { ActivateAccountUseCase } from './application/use-cases/activate-account.use-case';
import { FindAccountByIdentifierUseCase } from './application/use-cases/find-account-by-identifier.use-case';
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
    { provide: REGISTER_ACCOUNT_USECASE, useExisting: RegisterAccountUseCase },
    ActivateAccountUseCase,
    {
      provide: ACTIVATE_ACCOUNT_USECASE,
      useExisting: ActivateAccountUseCase,
    },
    FindAccountByIdentifierUseCase,
    {
      provide: FIND_ACCOUNT_BY_IDENTIFIER_USECASE,
      useExisting: FindAccountByIdentifierUseCase,
    },
    { provide: ACCOUNT_REPOSITORY, useClass: TypeOrmAccountRepository },
    { provide: ADDRESS_REPOSITORY, useClass: TypeOrmAddressRepository },
    { provide: PROFILE_REPOSITORY, useClass: TypeOrmProfileRepository },
    { provide: TRANSACTION_MANAGER, useClass: TypeOrmTransactionManager },
  ],
  exports: [
    REGISTER_ACCOUNT_USECASE,
    ACTIVATE_ACCOUNT_USECASE,
    FIND_ACCOUNT_BY_IDENTIFIER_USECASE,
  ],
})
export class AccountModule {}
