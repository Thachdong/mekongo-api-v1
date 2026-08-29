import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identifier: string;
}
