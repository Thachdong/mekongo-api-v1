import { IsNotEmpty, IsString } from 'class-validator';

export class JoinPostCommentsDto {
  @IsString()
  @IsNotEmpty()
  postId: string;
}
