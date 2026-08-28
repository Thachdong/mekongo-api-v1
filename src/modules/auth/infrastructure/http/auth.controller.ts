import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  RegisterUseCase,
  TAuthRegisterOutput,
} from '../../application/use-cases/register.use-case';
import {
  ResetPasswordUseCase,
  TAuthResetPasswordOutput,
} from '../../application/use-cases/reset-password.use-case';
import { VerifyUseCase } from '../../application/use-cases/verify.use-case';
import { RegisterRequestDto } from './dto/register-request.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { VerifyRequestDto } from './dto/verify-request.dto';
import { RegisterDoc } from './docs/register.doc';
import { ResetPasswordDoc } from './docs/reset-password.doc';
import { VerifyDoc } from './docs/verify.doc';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly _registerUseCase: RegisterUseCase,
    private readonly _verifyUseCase: VerifyUseCase,
    private readonly _resetPasswordUseCase: ResetPasswordUseCase,
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

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @VerifyDoc()
  async verify(@Body() body: VerifyRequestDto): Promise<null> {
    await this._verifyUseCase.execute({
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
}
