import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

type TApiResponseDataOptions = {
  status?: number;
  isArray?: boolean;
  description?: string;
};

/**
 * Documents an endpoint returning the project's TResponse<T> envelope
 * ({ data, meta }) without hand-writing the wrapper schema per DTO.
 */
export function ApiResponseData<TModel extends Type<any>>(
  model: TModel,
  { status = 200, isArray = false, description }: TApiResponseDataOptions = {},
) {
  const dataSchema = isArray
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      description,
      schema: {
        properties: {
          data: dataSchema,
          meta: {
            type: 'object',
            additionalProperties: true,
            nullable: true,
          },
        },
      },
    }),
  );
}
