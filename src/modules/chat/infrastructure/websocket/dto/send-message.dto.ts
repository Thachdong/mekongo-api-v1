import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  buyerProfileId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
