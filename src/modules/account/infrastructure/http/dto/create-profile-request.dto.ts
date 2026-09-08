import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TProfileType } from '../../../domain/value-objects/profile-type.enum';

const PROFILE_TYPES: TProfileType[] = ['INDIVIDUAL', 'DISTRIBUTOR', 'FACTORY'];

export class CreateProfileNewAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty()
  @IsInt()
  provinceCode: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  details: string;
}

export class CreateProfileRequestDto {
  @ApiProperty({ enum: PROFILE_TYPES })
  @IsIn(PROFILE_TYPES)
  profileType: TProfileType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @ApiProperty({ required: false, type: CreateProfileNewAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProfileNewAddressDto)
  newAddress?: CreateProfileNewAddressDto;
}
