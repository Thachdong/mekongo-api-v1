import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { CommentListItemResponseDto } from '../dto/comment-list-item-response.dto';

export function GetCommentsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách comment gốc (level 0) của 1 post, có phân trang',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(CommentListItemResponseDto, {
      status: 200,
      isArray: true,
      description: 'Danh sách comment gốc, kèm số lượng comment con',
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed — postId thiếu hoặc page/limit sai kiểu',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'array', items: { type: 'string' } },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Thiếu/sai/hết hạn access token (Authorization header)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string' },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    }),
  );
}
