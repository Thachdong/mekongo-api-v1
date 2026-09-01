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
import { JwtAuthGuard } from '@shared/common/auth/jwt-auth.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { ChangeOwnPasswordUseCase } from '../../application/use-cases/change-own-password.use-case';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { ChangePasswordDoc } from './docs/change-password.doc';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly _changeOwnPasswordUseCase: ChangeOwnPasswordUseCase,
  ) {}

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ChangePasswordDoc()
  async changePassword(
    @CurrentUser() user: TJwtPayload,
    @Body() body: ChangePasswordRequestDto,
  ): Promise<null> {
    await this._changeOwnPasswordUseCase.execute({
      accountId: user.accountId,
      currentPassword: body.oldPassword,
      newPassword: body.newPassword,
    });
    return null;
  }
}
