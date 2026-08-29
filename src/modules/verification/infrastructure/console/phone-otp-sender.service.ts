import { Injectable, Logger } from '@nestjs/common';
import { TSendOtpPayload } from '../../application/ports/otp-sender.interface';

@Injectable()
export class PhoneOtpSenderService {
  private readonly _logger = new Logger(PhoneOtpSenderService.name);

  send(payload: TSendOtpPayload): void {
    this._logger.log(
      `[SMS] to=${payload.identifier} purpose=${payload.purpose} code=${payload.code}`,
    );
  }
}
