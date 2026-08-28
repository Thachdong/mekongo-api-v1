import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReSendRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identifier: string;
}
