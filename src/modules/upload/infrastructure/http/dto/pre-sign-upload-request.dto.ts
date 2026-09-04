import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsString } from 'class-validator';

export class PreSignUploadRequestDto {
  @ApiProperty({ type: [String] })
  @ArrayNotEmpty()
  @IsString({ each: true })
  files: string[];
}
