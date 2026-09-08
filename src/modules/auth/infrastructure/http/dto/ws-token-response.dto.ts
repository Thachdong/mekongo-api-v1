import { ApiProperty } from '@nestjs/swagger';

export class WsTokenResponseDto {
  @ApiProperty()
  wsToken: string;
}
