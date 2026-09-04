import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { PreSignUploadRequestDto } from '../dto/pre-sign-upload-request.dto';
import { PreSignUploadResponseDto } from '../dto/pre-sign-upload-response.dto';

export function PreSignUploadDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Sinh TMP object key + signed upload URL cho danh sách file',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: PreSignUploadRequestDto }),
    ApiResponseData(PreSignUploadResponseDto, {
      status: 200,
      description: 'Sinh presign URL thành công',
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed — thiếu field hoặc sai kiểu',
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
