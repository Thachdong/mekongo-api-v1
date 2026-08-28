import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReSendOtpUseCase } from '../../application/use-cases/re-send-otp.use-case';
import { ReSendRequestDto } from './dto/re-send-request.dto';

@ApiTags('verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly _reSendOtpUseCase: ReSendOtpUseCase) {}

  @Post('re-send')
  @HttpCode(HttpStatus.OK)
  async reSend(@Body() body: ReSendRequestDto): Promise<null> {
    await this._reSendOtpUseCase.execute({
      identifier: body.identifier,
      purpose: body.purpose,
    });
    return null;
  }
}
