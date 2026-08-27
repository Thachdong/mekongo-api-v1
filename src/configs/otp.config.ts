import { registerAs } from '@nestjs/config';

export type TOtpConfig = {
  codeLength: number;
  expireMinutes: number;
};

export const otpConfig = registerAs('otp', (): TOtpConfig => ({
  codeLength: Number(process.env.OTP_CODE_LENGTH ?? 6),
  expireMinutes: Number(process.env.OTP_EXPIRE_MINUTES ?? 5),
}));
