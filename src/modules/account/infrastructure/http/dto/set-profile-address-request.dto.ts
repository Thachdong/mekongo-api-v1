import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SetProfileAddressRequestDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  profileId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  addressId: string;
}
