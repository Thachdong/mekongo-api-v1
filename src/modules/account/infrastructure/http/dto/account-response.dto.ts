import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  loginType: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: String, nullable: true })
  activeProfileId: string | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  blockUntil: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: Date | null;
}
