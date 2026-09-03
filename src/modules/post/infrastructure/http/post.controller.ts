import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/common/auth/current-user.decorator';
import { JwtAuthGuard } from '@shared/common/auth/jwt-auth.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { Post as PostEntity } from '../../domain/post.entity';
import { CreatePostRequestDto } from './dto/create-post-request.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { CreatePostDoc } from './docs/create-post.doc';

@ApiTags('post')
@Controller('posts')
export class PostController {
  constructor(private readonly _createPostUseCase: CreatePostUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @CreatePostDoc()
  async create(
    @CurrentUser() user: TJwtPayload,
    @Body() body: CreatePostRequestDto,
  ): Promise<PostResponseDto> {
    const post = await this._createPostUseCase.execute({
      accountId: user.accountId,
      profileId: user.profileId,
      postType: body.postType,
      title: body.title,
      content: body.content,
      images: body.images,
    });

    return this._toPostResponseDto(post);
  }

  private _toPostResponseDto(post: PostEntity): PostResponseDto {
    const dto = new PostResponseDto();
    dto.id = post.id as string;
    dto.postType = post.postType;
    dto.title = post.title;
    dto.content = post.content;
    dto.images = post.images;
    dto.provinceCode = post.provinceCode;
    dto.profileId = post.profileId;
    dto.likeCount = post.likeCount;
    dto.commentCount = post.commentCount;
    dto.createdAt = post.createdAt;
    dto.updatedAt = post.updatedAt;
    return dto;
  }
}
