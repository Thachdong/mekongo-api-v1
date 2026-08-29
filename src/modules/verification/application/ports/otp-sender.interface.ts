import { TOtpPurpose } from '../../domain/value-objects/otp-purpose.enum';

export type TSendOtpPayload = {
  identifier: string;
  code: string;
  purpose: TOtpPurpose;
};

export interface IOtpSender {
  send(payload: TSendOtpPayload): Promise<void>;
}
