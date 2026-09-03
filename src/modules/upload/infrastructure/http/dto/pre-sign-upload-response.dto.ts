import { ApiProperty } from '@nestjs/swagger';

export class PreSignUploadResponseDto {
  @ApiProperty({ type: [String] })
  keys: string[];

  @ApiProperty({ type: [String] })
  presignUrls: string[];
}
