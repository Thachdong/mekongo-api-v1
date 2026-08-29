import { Injectable, Logger } from '@nestjs/common';
import { TSendOtpPayload } from '../../application/ports/otp-sender.interface';

@Injectable()
export class EmailOtpSenderService {
  private readonly _logger = new Logger(EmailOtpSenderService.name);

  send(payload: TSendOtpPayload): void {
    this._logger.log(
      `[EMAIL] to=${payload.identifier} purpose=${payload.purpose} code=${payload.code}`,
    );
  }
}
