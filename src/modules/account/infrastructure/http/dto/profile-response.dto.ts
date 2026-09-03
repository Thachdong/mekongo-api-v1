import { ApiProperty } from '@nestjs/swagger';
import { TProfileType } from '../../../domain/value-objects/profile-type.enum';

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['INDIVIDUAL', 'DISTRIBUTOR', 'FACTORY'] })
  profileType: TProfileType;

  @ApiProperty()
  accountId: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: Date | null;
}
