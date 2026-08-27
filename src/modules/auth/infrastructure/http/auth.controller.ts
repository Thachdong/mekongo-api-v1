import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  RegisterUseCase,
  TAuthRegisterOutput,
} from '../../application/use-cases/register.use-case';
import { RegisterRequestDto } from './dto/register-request.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _registerUseCase: RegisterUseCase) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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
}
