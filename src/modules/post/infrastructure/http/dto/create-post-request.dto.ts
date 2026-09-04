import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { TPostType } from '../../../domain/value-objects/post-type.enum';

const POST_TYPES: TPostType[] = ['BUY', 'SELL'];

export class CreatePostRequestDto {
  @ApiProperty({ enum: POST_TYPES })
  @IsIn(POST_TYPES)
  postType: TPostType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ type: [String] })
  @ArrayNotEmpty()
  @IsString({ each: true })
  images: string[];
}
