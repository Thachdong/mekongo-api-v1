import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/common/auth/current-user.decorator';
import { JwtAuthGuard } from '@shared/common/auth/jwt-auth.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
import { GetCommentChildrenUseCase } from '../../application/use-cases/get-comment-children.use-case';
import { GetCommentsUseCase } from '../../application/use-cases/get-comments.use-case';
import { TCommentListItem } from '../../application/ports/get-comments-use-case.interface';
import { Comment } from '../../domain/comment.entity';
import { CommentGateway } from '../websocket/comment.gateway';
import { CommentListItemResponseDto } from './dto/comment-list-item-response.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentRequestDto } from './dto/create-comment-request.dto';
import { DeleteCommentRequestDto } from './dto/delete-comment-request.dto';
import { GetCommentChildrenRequestDto } from './dto/get-comment-children-request.dto';
import { GetCommentsRequestDto } from './dto/get-comments-request.dto';
import { CreateCommentDoc } from './docs/create-comment.doc';
import { DeleteCommentDoc } from './docs/delete-comment.doc';
import { GetCommentChildrenDoc } from './docs/get-comment-children.doc';
import { GetCommentsDoc } from './docs/get-comments.doc';

@ApiTags('comment')
@Controller('comments')
export class CommentController {
  constructor(
    private readonly _createCommentUseCase: CreateCommentUseCase,
    private readonly _deleteCommentUseCase: DeleteCommentUseCase,
    private readonly _getCommentsUseCase: GetCommentsUseCase,
    private readonly _getCommentChildrenUseCase: GetCommentChildrenUseCase,
    private readonly _commentGateway: CommentGateway,
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

    const dto = this._toCommentResponseDto(comment);
    this._commentGateway.broadcastNewComment(body.postId, dto);

    return dto;
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

  @Get()
  @UseGuards(JwtAuthGuard)
  @GetCommentsDoc()
  async getComments(@Query() query: GetCommentsRequestDto): Promise<{
    data: CommentListItemResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    const result = await this._getCommentsUseCase.execute({
      postId: query.postId,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: result.items.map((item) =>
        this._toCommentListItemResponseDto(item),
      ),
      meta: { total: result.total, page: query.page, limit: query.limit },
    };
  }

  @Get(':parentId/children')
  @UseGuards(JwtAuthGuard)
  @GetCommentChildrenDoc()
  async getCommentChildren(
    @Param('parentId') parentId: string,
    @Query() query: GetCommentChildrenRequestDto,
  ): Promise<{ data: CommentListItemResponseDto[] }> {
    const items = await this._getCommentChildrenUseCase.execute({
      postId: query.postId,
      parentId,
    });

    return {
      data: items.map((item) => this._toCommentListItemResponseDto(item)),
    };
  }

  private _toCommentListItemResponseDto(
    item: TCommentListItem,
  ): CommentListItemResponseDto {
    const dto = new CommentListItemResponseDto();
    dto.id = item.id;
    dto.content = item.content;
    dto.level = item.level;
    dto.parentId = item.parentId;
    dto.childrenCount = item.childrenCount;
    dto.author = item.author;
    return dto;
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
