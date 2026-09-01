import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/common/auth/current-user.decorator';
import { JwtRefreshAuthGuard } from '@shared/common/auth/jwt-refresh-auth.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import {
  RegisterUseCase,
  TAuthRegisterOutput,
} from '../../application/use-cases/register.use-case';
import {
  ResetPasswordUseCase,
  TAuthResetPasswordOutput,
} from '../../application/use-cases/reset-password.use-case';
import { ActivateUseCase } from '../../application/use-cases/activate.use-case';
import {
  LoginUseCase,
  TAuthLoginOutput,
} from '../../application/use-cases/login.use-case';
import {
  RefreshTokenUseCase,
  TAuthRefreshTokenOutput,
} from '../../application/use-cases/refresh-token.use-case';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { ActivateRequestDto } from './dto/activate-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { ChangePasswordDoc } from './docs/change-password.doc';
import { RegisterDoc } from './docs/register.doc';
import { ResetPasswordDoc } from './docs/reset-password.doc';
import { ActivateDoc } from './docs/activate.doc';
import { LoginDoc } from './docs/login.doc';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly _registerUseCase: RegisterUseCase,
    private readonly _activateUseCase: ActivateUseCase,
    private readonly _resetPasswordUseCase: ResetPasswordUseCase,
    private readonly _changePasswordUseCase: ChangePasswordUseCase,
    private readonly _loginUseCase: LoginUseCase,
    private readonly _refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterDoc()
  async register(
    @Body() body: RegisterRequestDto,
  ): Promise<TAuthRegisterOutput> {
    return this._registerUseCase.execute({
      loginType: body.loginType,
      identifier: body.identifier,
      password: body.password,
      displayName: body.identifier,
      avatarUrl: null,
      address: {
        label: body.label,
        province: body.province,
        provinceCode: body.provinceCode,
        ward: body.ward,
        details: body.details,
      },
      profileType: body.profileType,
    });
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ActivateDoc()
  async activate(@Body() body: ActivateRequestDto): Promise<null> {
    await this._activateUseCase.execute({
      identifier: body.identifier,
      code: body.code,
    });
    return null;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ResetPasswordDoc()
  async resetPassword(
    @Body() body: ResetPasswordRequestDto,
  ): Promise<TAuthResetPasswordOutput> {
    return this._resetPasswordUseCase.execute({
      identifier: body.identifier,
    });
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ChangePasswordDoc()
  async changePassword(@Body() body: ChangePasswordRequestDto): Promise<null> {
    await this._changePasswordUseCase.execute({
      identifier: body.identifier,
      code: body.code,
      password: body.password,
    });
    return null;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginDoc()
  async login(@Body() body: LoginRequestDto): Promise<TAuthLoginOutput> {
    return this._loginUseCase.execute({
      loginType: body.loginType,
      identifier: body.identifier,
      password: body.password,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @CurrentUser() user: TJwtPayload,
    @Body() body: RefreshTokenRequestDto,
  ): Promise<TAuthRefreshTokenOutput> {
    return this._refreshTokenUseCase.execute({
      accountId: user.accountId,
      profileId: user.profileId,
      refreshToken: body.refreshToken,
    });
  }
}
