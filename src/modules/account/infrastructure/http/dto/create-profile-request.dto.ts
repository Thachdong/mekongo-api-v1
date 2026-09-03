import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { TProfileType } from '../../../domain/value-objects/profile-type.enum';

const PROFILE_TYPES: TProfileType[] = ['INDIVIDUAL', 'DISTRIBUTOR', 'FACTORY'];

export class CreateProfileRequestDto {
  @ApiProperty({ enum: PROFILE_TYPES })
  @IsIn(PROFILE_TYPES)
  profileType: TProfileType;
}
