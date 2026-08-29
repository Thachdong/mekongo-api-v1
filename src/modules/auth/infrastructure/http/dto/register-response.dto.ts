import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  otpId: string;

  @ApiProperty({ type: String, format: 'date-time' })
  otpExpiredAt: Date;
}
