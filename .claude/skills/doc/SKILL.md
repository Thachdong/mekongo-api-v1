---
name: doc
description: Sinh swagger/OpenAPI documentation cho 1 endpoint đã tồn tại, bằng cách tạo decorator riêng (applyDecorators) rồi gắn vào method controller — không viết decorator rải rác trực tiếp trong controller. PHẢI dùng skill này sau khi 1 endpoint đã được tạo (skill infrastructure) và cần "gen swagger", "thêm api doc", "document endpoint". Skill này trace ngược qua use-case, domain-error, global exception filter để tự suy ra đầy đủ response status có thể xảy ra.
---

# Doc Skill

## Phạm vi ghi
- CHỈ 1 file decorator riêng, vd `modules/<name>/infrastructure/http/<name>.decorators.ts`.
- Method trong controller CHỈ được sửa để gắn thêm decorator tổng hợp (1 dòng), không thêm decorator rải rác — nếu controller cần sửa nhiều hơn 1 dòng đó, dừng và báo out-of-scope.

## Phạm vi đọc — KHÔNG giới hạn, và PHẢI trace đầy đủ theo trình tự sau
1. Controller method mục tiêu (request/response DTO, HTTP method, path).
2. Use-case mà endpoint đó gọi (đọc input/output).
3. Domain-error mà use-case đó (và các use-case nó gọi lồng bên trong, nếu có) có
   thể ném ra — đọc trong `domain/`.
4. Global exception filter (đường dẫn lấy từ `docs/architecture/constitution.md`)
   — đọc mapping domain-error → HTTP status.
5. Global validation pipe (constitution) — để biết status/format lỗi validate
   (thường 400).
6. Global interceptor (nếu có, theo constitution) — có thể ảnh hưởng response
   envelope/shape.

## Bước 0 — Đọc constitution
Lấy đường dẫn global exception filter, validation pipe, interceptor, và response
envelope format từ `docs/architecture/constitution.md`. Nếu thiếu → dừng, yêu cầu
chạy `constitution` trước.

## Quy trình

1. Trace đầy đủ theo 6 bước ở trên.
2. Với mỗi domain-error tìm được ở bước 3:
   - Nếu ĐÃ có mapping trong global exception filter → tạo `@ApiResponse` đúng
     status code đó, mô tả ngắn gọn theo tên error.
   - Nếu CHƯA có mapping → KHÔNG được tự đoán status code. Liệt kê error đó vào
     phần "cần dev xác nhận / cần bổ sung filter mapping" thay vì generate sai.
3. Tạo `@ApiResponse` cho response thành công dựa trên response DTO thật của
   controller (đúng shape/envelope theo constitution).
4. Gộp toàn bộ decorator (`@ApiOperation`, `@ApiResponse` các loại, `@ApiParam`,
   `@ApiBody`...) bằng `applyDecorators()` thành 1 decorator tổng đặt trong file
   `*.decorators.ts`.
5. Gắn decorator tổng đó vào đúng method controller (1 dòng duy nhất thêm vào
   controller).

## Sau khi ghi code — Self-review checklist

```
✅ Self-review checklist — Doc
[ ] Đã trace đủ: controller → use-case → domain-error → global filter →
    validation pipe → interceptor
[ ] Mỗi domain-error có thể xảy ra đều có @ApiResponse tương ứng (không chỉ
    200/201)
[ ] Domain-error nào chưa có mapping trong global filter đã được liệt kê rõ,
    KHÔNG bị đoán status bừa
[ ] Response DTO trong doc khớp đúng response DTO thật của controller
[ ] Decorator gộp bằng applyDecorators(), controller chỉ thêm đúng 1 dòng
[ ] Không có decorator swagger nào bị rải rác trực tiếp trong controller
```

## Out-of-scope
Nếu phát hiện domain-error thiếu mapping trong global filter, hoặc response DTO
không khớp response thật (bug ở endpoint) → dùng format tại
`docs/architecture/out-of-scope-format.md`, trỏ sang `infrastructure` (sửa
endpoint) hoặc báo trực tiếp cho dev (sửa global filter không thuộc quyền ghi của
bất kỳ atomic skill nào trong bộ này — cần dev tự xử lý hoặc mở rộng scope sau).
