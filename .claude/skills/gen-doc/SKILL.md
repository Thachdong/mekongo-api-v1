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

## Bước 3 — Trace exception xuyên module

Từ use-case chính (application/use-cases/ cùng module controller), trace toàn bộ lời gọi tới use-case/service khác:
- Kể cả cross-module — theo interface import từ `@modules/<other>/public-api`, tìm class thật bind qua DI token trong `*.module.ts` (`provide: <TOKEN>, useClass: <Impl>`), đọc implementation thật.
- Đi tới tận domain entity/repository — method domain entity nào được gọi trên đường đi (constructor, `.create()`, `.activate()`...), chỉ tính method thực sự được gọi trong nhánh code này, không tính toàn bộ method có trong class.

Với mỗi bước trong chain, liệt kê nguồn lỗi thật sự phát sinh được (không suy đoán, không thêm case không tồn tại trong code):

- **`DomainError` subclass** bị `throw` trực tiếp trong nhánh code đã đi qua. Đọc base class lỗi (vd `src/shared/kernel/errors/domain-error.ts`) để biết `status`/`code` baked sẵn trong từng subclass — dùng đúng giá trị đó, không tự suy theo tên class.
- **`HttpException`** — vd `ValidationPipe` toàn cục (`APP_PIPE`) sinh `BadRequestException` (400) từ `class-validator` decorator trên request DTO. Có mặt bất cứ khi nào request DTO có validation decorator.
- **Lỗi hạ tầng không được wrap** (DB constraint fail, `ConfigService.getOrThrow` thiếu key, v.v.) — rơi vào nhánh generic (thường 500) của exception filter.

Tìm global exception filter (`@Catch()` đăng ký qua `APP_FILTER` trong `app.module.ts` hoặc tương đương) để xác nhận từng loại lỗi trên map ra HTTP status nào trong thực tế — lấy status từ filter, không đoán.

Ràng buộc khi liệt kê:
- CHỈ liệt kê case thật sự **reachable** từ use-case đang doc (đường đi thực tế của code). Không thêm case "cho đủ" nếu domain chưa có check đó — vd nếu account module chưa có check trùng identifier thì KHÔNG được bịa `ApiResponse` "already exists".
- Nếu phát hiện gap rõ ràng (thiếu domain error cụ thể, lỗi rơi vào 500 generic thay vì lỗi nghiệp vụ có tên) — đây là vấn đề code, không phải vấn đề doc. Báo lại cho user sau khi xong, KHÔNG tự thêm domain error/use-case mới để "vá" gap này (vi phạm ràng buộc chỉ sửa DTO/doc/controller decorator).

## Bước 4 — Tạo file doc

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
- Dùng kết quả bước 3 để thêm `ApiResponse({ status, description })` cho từng nguồn lỗi reachable:
  - Request DTO có validation decorator → `ApiResponse({ status: 400, description: 'Validation failed' })` (hoặc mô tả field cụ thể nếu rõ ràng).
  - Mỗi `DomainError` subclass tìm được → 1 `ApiResponse` riêng, status lấy từ chính error đó, description ngắn gọn nêu điều kiện throw.
  - Có nhánh lỗi hạ tầng không wrap (xác nhận ở bước 3) → `ApiResponse({ status: 500, description: 'Internal server error' })`.
  - Không thêm `ApiResponse` cho status/case không xác nhận được ở bước 3.
- Không import gì từ domain/application ngoài việc đọc để xác định DTO/status — file doc chỉ chứa decorator, không chứa logic.

## Bước 5 — Gắn decorator lên controller

Trong file controller: import function doc từ `./docs/<file>.doc`, gắn duy nhất decorator đó lên method (xoá mọi `@ApiOperation`/`@ApiResponse`/`@ApiBody`... rời rạc đang có sẵn trên method nếu có — gộp hết vào file doc).

```ts
@Post()
@CreateAccountDoc()
async create(@Body() dto: CreateAccountRequestDto) { ... }
```

Method chỉ còn đúng 1 decorator liên quan tới swagger doc (các decorator khác như `@Post()`, `@UseGuards()` giữ nguyên, không tính vào ràng buộc "1 decorator").

## Ràng buộc

- Chỉ sửa: DTO liên quan (bước 2, chỉ khi cần), file doc mới tạo (bước 4), controller (bước 5 — chỉ phần decorator, không đổi logic method).
- Không sửa domain/application, không đổi route path/method HTTP, không tạo use-case/DTO mới ngoài phạm vi endpoint đang doc.
- Không report gì thêm sau khi xong — im lặng, TRỪ 2 trường hợp: endpoint chưa tồn tại (bước 1), hoặc phát hiện gap ở bước 3 (lỗi nghiệp vụ rõ ràng có thể xảy ra nhưng code chưa có domain error riêng, rơi vào 500 generic) — báo ngắn gọn case đó, không tự sửa.
