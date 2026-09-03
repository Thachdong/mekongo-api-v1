import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/common/auth/current-user.decorator';
import { Account } from '../../domain/account.entity';
import { Address } from '../../domain/address.entity';
import { JwtAuthGuard } from '@shared/common/auth/jwt-auth.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { ChangeOwnPasswordUseCase } from '../../application/use-cases/account/change-own-password.use-case';
import { FindAccountByIdUseCase } from '../../application/use-cases/account/find-account-by-id.use-case';
import { UpdateAccountProfileUseCase } from '../../application/use-cases/account/update-account-profile.use-case';
import { CreateAddressUseCase } from '../../application/use-cases/address/create-address.use-case';
import { DeleteAddressUseCase } from '../../application/use-cases/address/delete-address.use-case';
import { GetAccountAddressesUseCase } from '../../application/use-cases/address/get-account-addresses.use-case';
import { SetCurrentAddressUseCase } from '../../application/use-cases/address/set-current-address.use-case';
import { AccountResponseDto } from './dto/account-response.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import { ChangeOwnPasswordRequestDto } from './dto/change-password-request.dto';
import { CreateAddressRequestDto } from './dto/create-address-request.dto';
import { DeleteAddressRequestDto } from './dto/delete-address-request.dto';
import { SetCurrentAddressRequestDto } from './dto/set-current-address-request.dto';
import { UpdateAccountProfileRequestDto } from './dto/update-account-profile-request.dto';
import { ChangePasswordDoc } from './docs/change-password.doc';
import { CreateAddressDoc } from './docs/create-address.doc';
import { DeleteAddressDoc } from './docs/delete-address.doc';
import { GetAccountDoc } from './docs/get-account.doc';
import { GetAccountAddressesDoc } from './docs/get-account-addresses.doc';
import { SetCurrentAddressDoc } from './docs/set-current-address.doc';
import { UpdateAccountProfileDoc } from './docs/update-account-profile.doc';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly _changeOwnPasswordUseCase: ChangeOwnPasswordUseCase,
    private readonly _updateAccountProfileUseCase: UpdateAccountProfileUseCase,
    private readonly _getAccountAddressesUseCase: GetAccountAddressesUseCase,
    private readonly _setCurrentAddressUseCase: SetCurrentAddressUseCase,
    private readonly _createAddressUseCase: CreateAddressUseCase,
    private readonly _deleteAddressUseCase: DeleteAddressUseCase,
    private readonly _findAccountByIdUseCase: FindAccountByIdUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @GetAccountDoc()
  async getAccount(
    @CurrentUser() user: TJwtPayload,
  ): Promise<AccountResponseDto> {
    const account = await this._findAccountByIdUseCase.execute({
      accountId: user.accountId,
    });

    return this._toAccountResponseDto(account);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ChangePasswordDoc()
  async changePassword(
    @CurrentUser() user: TJwtPayload,
    @Body() body: ChangeOwnPasswordRequestDto,
  ): Promise<null> {
    await this._changeOwnPasswordUseCase.execute({
      accountId: user.accountId,
      currentPassword: body.oldPassword,
      newPassword: body.newPassword,
    });
    return null;
  }

  @Put('update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UpdateAccountProfileDoc()
  async updateProfile(
    @CurrentUser() user: TJwtPayload,
    @Body() body: UpdateAccountProfileRequestDto,
  ): Promise<null> {
    await this._updateAccountProfileUseCase.execute({
      accountId: user.accountId,
      displayName: body.displayName,
      avatarUrl: body.avatarUrl,
    });
    return null;
  }

  @Get('address')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @GetAccountAddressesDoc()
  async getAddresses(
    @CurrentUser() user: TJwtPayload,
  ): Promise<AddressResponseDto[]> {
    const addresses = await this._getAccountAddressesUseCase.execute({
      accountId: user.accountId,
    });

    return addresses.map((address) => this._toAddressResponseDto(address));
  }

  @Put('set-current-address')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @SetCurrentAddressDoc()
  async setCurrentAddress(
    @CurrentUser() user: TJwtPayload,
    @Body() body: SetCurrentAddressRequestDto,
  ): Promise<null> {
    await this._setCurrentAddressUseCase.execute({
      accountId: user.accountId,
      addressId: body.addressId,
    });
    return null;
  }

  @Post('address')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @CreateAddressDoc()
  async createAddress(
    @CurrentUser() user: TJwtPayload,
    @Body() body: CreateAddressRequestDto,
  ): Promise<AddressResponseDto> {
    const address = await this._createAddressUseCase.execute({
      accountId: user.accountId,
      label: body.label,
      province: body.province,
      provinceCode: body.provinceCode,
      ward: body.ward,
      details: body.details,
    });

    return this._toAddressResponseDto(address);
  }

  @Delete('address')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @DeleteAddressDoc()
  async deleteAddress(
    @CurrentUser() user: TJwtPayload,
    @Body() body: DeleteAddressRequestDto,
  ): Promise<null> {
    await this._deleteAddressUseCase.execute({
      accountId: user.accountId,
      addressId: body.addressId,
    });
    return null;
  }

  private _toAccountResponseDto(account: Account): AccountResponseDto {
    const dto = new AccountResponseDto();
    dto.id = account.id;
    dto.loginType = account.loginType;
    dto.status = account.status;
    dto.displayName = account.displayName;
    dto.avatarUrl = account.avatarUrl;
    dto.currentAddressId = account.currentAddressId;
    dto.activeProfileId = account.activeProfileId;
    dto.blockUntil = account.blockUntil;
    dto.createdAt = account.createdAt;
    dto.updatedAt = account.updatedAt;
    return dto;
  }

  private _toAddressResponseDto(address: Address): AddressResponseDto {
    const dto = new AddressResponseDto();
    dto.id = address.id;
    dto.label = address.label;
    dto.province = address.province;
    dto.provinceCode = address.provinceCode;
    dto.ward = address.ward;
    dto.details = address.details;
    dto.createdAt = address.createdAt;
    dto.updatedAt = address.updatedAt;
    return dto;
  }
}
