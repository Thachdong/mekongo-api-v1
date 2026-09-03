import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '@shared/infrastructure/storage/storage.module';
import {
  ACCOUNT_REPOSITORY,
  ACTIVATE_ACCOUNT_USECASE,
  ADDRESS_REPOSITORY,
  CHANGE_ACCOUNT_PASSWORD_USECASE,
  CHANGE_OWN_PASSWORD_USECASE,
  CREATE_ADDRESS_USECASE,
  CREATE_PROFILE_USECASE,
  DELETE_ADDRESS_USECASE,
  FIND_ACCOUNT_BY_ID_USECASE,
  FIND_ACCOUNT_BY_IDENTIFIER_USECASE,
  GET_ACCOUNT_ADDRESSES_USECASE,
  GET_ACCOUNT_PROFILES_USECASE,
  PROFILE_REPOSITORY,
  REGISTER_ACCOUNT_USECASE,
  SET_CURRENT_ADDRESS_USECASE,
  TRANSACTION_MANAGER,
  UPDATE_ACCOUNT_PROFILE_USECASE,
} from './application/ports/account-application.tokens';
import { ActivateAccountUseCase } from './application/use-cases/account/activate-account.use-case';
import { ChangeAccountPasswordUseCase } from './application/use-cases/account/change-account-password.use-case';
import { ChangeOwnPasswordUseCase } from './application/use-cases/account/change-own-password.use-case';
import { FindAccountByIdUseCase } from './application/use-cases/account/find-account-by-id.use-case';
import { FindAccountByIdentifierUseCase } from './application/use-cases/account/find-account-by-identifier.use-case';
import { RegisterAccountUseCase } from './application/use-cases/account/register-account.use-case';
import { UpdateAccountProfileUseCase } from './application/use-cases/account/update-account-profile.use-case';
import { CreateAddressUseCase } from './application/use-cases/address/create-address.use-case';
import { DeleteAddressUseCase } from './application/use-cases/address/delete-address.use-case';
import { GetAccountAddressesUseCase } from './application/use-cases/address/get-account-addresses.use-case';
import { SetCurrentAddressUseCase } from './application/use-cases/address/set-current-address.use-case';
import { CreateProfileUseCase } from './application/use-cases/profile/create-profile.use-case';
import { GetAccountProfilesUseCase } from './application/use-cases/profile/get-account-profiles.use-case';
import { AccountController } from './infrastructure/http/account.controller';
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
    StorageModule,
  ],
  controllers: [AccountController],
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
    ChangeAccountPasswordUseCase,
    {
      provide: CHANGE_ACCOUNT_PASSWORD_USECASE,
      useExisting: ChangeAccountPasswordUseCase,
    },
    ChangeOwnPasswordUseCase,
    {
      provide: CHANGE_OWN_PASSWORD_USECASE,
      useExisting: ChangeOwnPasswordUseCase,
    },
    UpdateAccountProfileUseCase,
    {
      provide: UPDATE_ACCOUNT_PROFILE_USECASE,
      useExisting: UpdateAccountProfileUseCase,
    },
    GetAccountAddressesUseCase,
    {
      provide: GET_ACCOUNT_ADDRESSES_USECASE,
      useExisting: GetAccountAddressesUseCase,
    },
    SetCurrentAddressUseCase,
    {
      provide: SET_CURRENT_ADDRESS_USECASE,
      useExisting: SetCurrentAddressUseCase,
    },
    CreateAddressUseCase,
    {
      provide: CREATE_ADDRESS_USECASE,
      useExisting: CreateAddressUseCase,
    },
    DeleteAddressUseCase,
    {
      provide: DELETE_ADDRESS_USECASE,
      useExisting: DeleteAddressUseCase,
    },
    FindAccountByIdUseCase,
    {
      provide: FIND_ACCOUNT_BY_ID_USECASE,
      useExisting: FindAccountByIdUseCase,
    },
    CreateProfileUseCase,
    {
      provide: CREATE_PROFILE_USECASE,
      useExisting: CreateProfileUseCase,
    },
    GetAccountProfilesUseCase,
    {
      provide: GET_ACCOUNT_PROFILES_USECASE,
      useExisting: GetAccountProfilesUseCase,
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
    CHANGE_ACCOUNT_PASSWORD_USECASE,
  ],
})
export class AccountModule {}
