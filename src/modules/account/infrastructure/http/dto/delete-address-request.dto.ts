import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteAddressRequestDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  addressId: string;
}
