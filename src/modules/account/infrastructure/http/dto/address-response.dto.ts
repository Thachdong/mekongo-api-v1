import { ApiProperty } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  provinceCode: number;

  @ApiProperty()
  ward: string;

  @ApiProperty()
  details: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: Date | null;
}
