import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SetActiveProfileRequestDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  profileId: string;
}
