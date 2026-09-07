import { ApiProperty } from '@nestjs/swagger';

export class NotificationActorResponseDto {
  @ApiProperty()
  profileId: string;

  @ApiProperty({ nullable: true, type: String })
  displayName: string | null;

  @ApiProperty({ nullable: true, type: String })
  avatarUrl: string | null;
}
