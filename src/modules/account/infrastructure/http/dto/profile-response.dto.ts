import { ApiProperty } from '@nestjs/swagger';
import { TProfileType } from '../../../domain/value-objects/profile-type.enum';

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['INDIVIDUAL', 'DISTRIBUTOR', 'FACTORY'] })
  profileType: TProfileType;

  @ApiProperty()
  accountId: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ type: String, nullable: true })
  addressId: string | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: Date | null;
}
