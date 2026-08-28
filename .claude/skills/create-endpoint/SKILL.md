---
name: create-endpoint
description: Phân tích yêu cầu tạo endpoint mới, xác định use-case có sẵn/cần tạo/lấy từ module khác, tạo luôn request/response DTO nếu đủ thông tin, ghi report vào guides/<endpoint>.md. Không code use-case/domain/infra. Dùng khi user gọi /create-endpoint <mô tả hoặc route> hoặc yêu cầu "tạo endpoint X".
---

# /create-endpoint

Skill **phân tích use-case + ghi report**, chỉ tạo file thật là DTO (nếu đủ thông tin), không sửa/tạo domain, application use-case, infra khác ngoài DTO.

Input: mô tả yêu cầu tạo endpoint (route, method, DTO, entities...) — có thể là route thô (`POST /accounts/verify`) hoặc mô tả tự nhiên.

## Bước 1 — Thu thập input bắt buộc

Từ input của user, rút ra:

- **Endpoint (route) + HTTP method** — bắt buộc.
- **Entities được xử lý** — bắt buộc (tên domain entity/object liên quan tới hành vi endpoint, vd `Account`, `Otp`).
- **Request DTO** — optional, chỉ cần nếu endpoint nhận input (field + kiểu nếu user có mô tả).
- **Response DTO** — optional, chỉ cần nếu endpoint trả data cụ thể (field + kiểu nếu user có mô tả).

Thiếu **endpoint/method** hoặc **entities** → hỏi lại user đúng phần thiếu (dùng AskUserQuestion nếu có lựa chọn rõ, hoặc hỏi thẳng), KHÔNG tự đoán, KHÔNG ghi report tạm. Đủ input → qua bước 2.

## Bước 2 — Xác định module đích

Suy module đích theo thứ tự ưu tiên:

1. Prefix route trùng path module đã có (`src/modules/<name>/infrastructure/http/*.controller.ts` có `@Controller('<prefix>')` khớp).
2. Entity chính nằm trong module nào (`src/modules/<name>/domain/*.entity.ts`).

Nếu không khớp module nào đang tồn tại → đây là module mới, ghi rõ trong report (không tạo module thật).

## Bước 3 — Rà soát use-case có sẵn (module đích)

Đọc thật `application/use-cases/` của module đích — không suy đoán theo tên. Use-case nào đã thực hiện đúng/gần đúng hành vi cần cho endpoint → đưa vào mục 1 report.

## Bước 4 — Xác định use-case cần tạo (module đích)

Hành vi endpoint cần mà module đích chưa có use-case thực hiện → đặt tên use-case theo convention project (vd `ResetPasswordUseCase`), ghi 1 dòng vai trò/orchestrate. Không tạo file use-case thật.

## Bước 5 — Xác định use-case cần lấy từ module khác

Hành vi endpoint cần dùng entity/logic không thuộc module đích:

- Đọc `public-api.ts` module kia — đã export use-case đúng hành vi → dùng thẳng.
- Use-case đã tồn tại ở module kia nhưng chưa export → ghi chú "cần `/export-use-case` trước".
- Chưa có use-case nào thực hiện hành vi đó → tên use-case dự kiến + đánh dấu `(cần tạo)`.

Không suy đoán token/path — đọc `public-api.ts` và `*.module.ts` thật của module kia.

## Bước 6 — DTO

Request/response DTO không bị tham chiếu từ module khác (chỉ dùng nội bộ controller) → **không chỉ ghi vào report, tạo luôn file DTO thật** khi đã đủ field + kiểu:

- Đọc 1 DTO có sẵn cùng module để theo đúng pattern decorator (`@ApiProperty`, `class-validator`...).
- Path: `src/modules/<module-đích>/infrastructure/http/dto/<tên>.dto.ts`.
- Field nào user chưa cho kiểu/optional rõ → hỏi lại thay vì đoán.

Nếu thiếu field (user không mô tả) → chỉ ghi trong report là DTO cần tạo, không tạo file rỗng đoán field.

## Bước 7 — Ghi report

Path: `guides/<endpoint-slug>.md` (root project, ngang cấp `src/`). `<endpoint-slug>`: method thường + path, `/` và tham số thay bằng `-`, bỏ dấu `:`/`{}` — vd `POST /accounts/verify` → `guides/post-accounts-verify.md`.

Format nội dung:

```md
# <METHOD> <endpoint>

DTO: `<TênDto> { field: type }` — đã tạo (`<path>`) / cần tạo (thiếu field)

## 1. Use-case có sẵn (module `<đích>`)
- `<TênUseCase>` — <ghi chú tái dùng>

## 2. Use-case cần tạo (module `<đích>`)
- `<TênUseCase>` — <vai trò 1 dòng>

## 3. Use-case cần lấy từ module khác
- `<TênUseCase>` (module `<other>`) — <vai trò 1 dòng> [(cần tạo) nếu chưa tồn tại]
```

Mục nào rỗng → ghi `- (không có)`, không bỏ trống heading.

Ghi file bằng Write/Edit trực tiếp, **không in nội dung report ra terminal/UI**. Sau khi ghi xong chỉ báo path report (+ path DTO nếu đã tạo).

## Ràng buộc

- Chỉ tạo file thật là DTO (bước 6). Không tạo/sửa domain, use-case, port, module wiring, controller thật.
- Không bịa resource — tên use-case ở mục 1 và 3 phải khớp use-case thật đọc được trong repo; mục 2/3 phần "cần tạo" chỉ dùng convention thật của project, không bịa pattern lạ.
- Không report nội dung phân tích ra chat — toàn bộ report nằm trong file, chat chỉ xác nhận đường dẫn.
