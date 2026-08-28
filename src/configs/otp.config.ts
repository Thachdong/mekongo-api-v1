import { registerAs } from '@nestjs/config';

export type TOtpConfig = {
  codeLength: number;
  expireMinutes: number;
  maxWrongCount: number;
  blockDurationMinutes: number;
};

export const otpConfig = registerAs('otp', (): TOtpConfig => ({
  codeLength: Number(process.env.OTP_CODE_LENGTH ?? 6),
  expireMinutes: Number(process.env.OTP_EXPIRE_MINUTES ?? 5),
  maxWrongCount: Number(process.env.OTP_MAX_WRONG_COUNT ?? 5),
  blockDurationMinutes: Number(process.env.OTP_BLOCK_DURATION_MINUTES ?? 15),
}));
