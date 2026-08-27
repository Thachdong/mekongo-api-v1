import { Injectable } from '@nestjs/common';
import {
  IOtpSender,
  TSendOtpPayload,
} from '../../application/ports/otp-sender.interface';
import { EmailOtpSenderService } from './email-otp-sender.service';
import { PhoneOtpSenderService } from './phone-otp-sender.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class ConsoleOtpSender implements IOtpSender {
  constructor(
    private readonly _emailSender: EmailOtpSenderService,
    private readonly _phoneSender: PhoneOtpSenderService,
  ) {}

  async send(payload: TSendOtpPayload): Promise<void> {
    if (EMAIL_REGEX.test(payload.identifier)) {
      this._emailSender.send(payload);
      return;
    }
    this._phoneSender.send(payload);
  }
}
