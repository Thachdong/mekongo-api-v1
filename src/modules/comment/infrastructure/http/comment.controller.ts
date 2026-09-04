import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/common/auth/current-user.decorator';
import { JwtAuthGuard } from '@shared/common/auth/jwt-auth.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
import { Comment } from '../../domain/comment.entity';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentRequestDto } from './dto/create-comment-request.dto';
import { DeleteCommentRequestDto } from './dto/delete-comment-request.dto';
import { CreateCommentDoc } from './docs/create-comment.doc';
import { DeleteCommentDoc } from './docs/delete-comment.doc';

@ApiTags('comment')
@Controller('comments')
export class CommentController {
  constructor(
    private readonly _createCommentUseCase: CreateCommentUseCase,
    private readonly _deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @CreateCommentDoc()
  async create(
    @CurrentUser() user: TJwtPayload,
    @Body() body: CreateCommentRequestDto,
  ): Promise<CommentResponseDto> {
    const comment = await this._createCommentUseCase.execute({
      profileId: user.profileId,
      postId: body.postId,
      parentId: body.parentId ?? null,
      content: body.content,
    });

    return this._toCommentResponseDto(comment);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @DeleteCommentDoc()
  async delete(
    @CurrentUser() user: TJwtPayload,
    @Body() body: DeleteCommentRequestDto,
  ): Promise<null> {
    await this._deleteCommentUseCase.execute({
      profileId: user.profileId,
      commentId: body.commentId,
    });

    return null;
  }

  private _toCommentResponseDto(comment: Comment): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = comment.id as string;
    dto.content = comment.content;
    dto.parentId = comment.parentId;
    dto.postId = comment.postId;
    dto.profileId = comment.profileId;
    dto.level = comment.level;
    dto.createdAt = comment.createdAt;
    dto.updatedAt = comment.updatedAt;
    return dto;
  }
}
