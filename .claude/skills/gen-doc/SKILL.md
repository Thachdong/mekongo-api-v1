---
name: gen-doc
description: Gen swagger document cho 1 endpoint cụ thể — check DTO, tạo file doc riêng, gắn đúng 1 decorator lên method. Dùng khi user gọi /gen-doc <endpoint> hoặc yêu cầu "gen doc cho endpoint X".
---

# /gen-doc

Input: endpoint cần doc — route (`POST /accounts`) hoặc tên method controller (`AccountController.create`).

## Bước 1 — Check endpoint tồn tại

Tìm controller + method tương ứng trong `src/modules/<name>/infrastructure/http/*.controller.ts` (theo route path hoặc method name).

- KHÔNG tìm thấy: báo "endpoint chưa tồn tại" (nêu route/method đã tìm), dừng luôn, không code gì thêm.
- Tồn tại: qua bước 2.

## Bước 2 — Xác định DTO liên quan

Từ method: request DTO (param `@Body()`/`@Query()`/`@Param()`), response DTO (kiểu trả về / generic của `TResponse<T>`).

Dự án dùng nest-cli plugin `@nestjs/swagger` (`classValidatorShim` + `introspectComments`) — DTO có decorator `class-validator` sẽ tự có schema, không cần thêm `@ApiProperty` thủ công cho field đã rõ type.

Chỉ thêm decorator vào DTO khi:
- Field không tự suy ra được type/format (union phức tạp, enum, nested generic).
- Cần `description`/`example` cụ thể không tự sinh được.
- Field optional cần `required: false` tường minh.

Thêm trực tiếp `@ApiProperty(...)` / `@ApiPropertyOptional(...)` vào đúng property trong DTO gốc (không tạo DTO mới, không tạo bản sao).

## Bước 3 — Tạo file doc

Vị trí: `<thư mục chứa controller>/docs/<kebab-case-tên-action>.doc.ts` — cùng cấp với controller (`infrastructure/http/docs/`).

Nội dung: 1 function decorator duy nhất, PascalCase, hậu tố `Doc`, gộp toàn bộ decorator swagger cho endpoint bằng `applyDecorators`:

```ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { CreateAccountResponseDto } from '../dto/create-account-response.dto';

export function CreateAccountDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Tạo account mới' }),
    ApiBody({ type: CreateAccountRequestDto }),
    ApiResponseData(CreateAccountResponseDto, { status: 201 }),
    // ApiBearerAuth('access-token') nếu route có guard auth
  );
}
```

Quy tắc nội dung file doc:
- Dùng `ApiResponseData` (`@shared/common/swagger/api-response-data.decorator`) cho response chính — khớp envelope `TResponse<T>` toàn dự án, không tự viết schema `data`/`meta` tay.
- Thêm `ApiBearerAuth('access-token')` nếu method có guard yêu cầu access token.
- Thêm `ApiParam`/`ApiQuery` nếu route có path/query param.
- Nếu use-case tương ứng throw `DomainError` cụ thể (check trong `application/use-cases/`), thêm `ApiResponse({ status, description })` cho các status đó.
- Không import gì từ domain/application ngoài việc đọc để xác định DTO/status — file doc chỉ chứa decorator, không chứa logic.

## Bước 4 — Gắn decorator lên controller

Trong file controller: import function doc từ `./docs/<file>.doc`, gắn duy nhất decorator đó lên method (xoá mọi `@ApiOperation`/`@ApiResponse`/`@ApiBody`... rời rạc đang có sẵn trên method nếu có — gộp hết vào file doc).

```ts
@Post()
@CreateAccountDoc()
async create(@Body() dto: CreateAccountRequestDto) { ... }
```

Method chỉ còn đúng 1 decorator liên quan tới swagger doc (các decorator khác như `@Post()`, `@UseGuards()` giữ nguyên, không tính vào ràng buộc "1 decorator").

## Ràng buộc

- Chỉ sửa: DTO liên quan (bước 2, chỉ khi cần), file doc mới tạo (bước 3), controller (bước 4 — chỉ phần decorator, không đổi logic method).
- Không sửa domain/application, không đổi route path/method HTTP, không tạo use-case/DTO mới ngoài phạm vi endpoint đang doc.
- Không report gì thêm sau khi xong — im lặng, chỉ báo khi endpoint chưa tồn tại (bước 1).
