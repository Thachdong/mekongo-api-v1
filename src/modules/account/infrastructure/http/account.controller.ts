import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/common/auth/current-user.decorator';
import { JwtAuthGuard } from '@shared/common/auth/jwt-auth.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { ChangeOwnPasswordUseCase } from '../../application/use-cases/change-own-password.use-case';
import { GetAccountAddressesUseCase } from '../../application/use-cases/get-account-addresses.use-case';
import { UpdateAccountProfileUseCase } from '../../application/use-cases/update-account-profile.use-case';
import { AddressResponseDto } from './dto/address-response.dto';
import { ChangeOwnPasswordRequestDto } from './dto/change-password-request.dto';
import { UpdateAccountProfileRequestDto } from './dto/update-account-profile-request.dto';
import { ChangePasswordDoc } from './docs/change-password.doc';
import { GetAccountAddressesDoc } from './docs/get-account-addresses.doc';
import { UpdateAccountProfileDoc } from './docs/update-account-profile.doc';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly _changeOwnPasswordUseCase: ChangeOwnPasswordUseCase,
    private readonly _updateAccountProfileUseCase: UpdateAccountProfileUseCase,
    private readonly _getAccountAddressesUseCase: GetAccountAddressesUseCase,
  ) {}

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

    return addresses.map((address) => {
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
    });
  }
}
