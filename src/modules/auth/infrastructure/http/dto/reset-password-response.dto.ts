import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty()
  otpId: string;

  @ApiProperty({ type: String, format: 'date-time' })
  otpExpiredAt: Date;
}
