import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { TOtpPurpose } from '../../../domain/value-objects/otp-purpose.enum';

export class ReSendRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ enum: ['ACCOUNT_VERIFICATION', 'RESET_PASSWORD'] })
  @IsIn(['ACCOUNT_VERIFICATION', 'RESET_PASSWORD'])
  purpose: TOtpPurpose;
}
