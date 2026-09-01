---
name: domain
description: Tạo hoặc sửa entity, value-object, domain-error trong domain layer của 1 module NestJS Hexagonal. PHẢI dùng skill này bất cứ khi nào cần entity/value-object/domain-error mới, hoặc cần thêm method vào entity đã có — kể cả khi request chỉ nói "thêm field", "thêm rule cho entity X". KHÔNG dùng skill này để tạo use-case, port, controller, hay bất kỳ thứ gì thuộc application/infrastructure — những việc đó thuộc skill use-case / infrastructure.
---

# Domain Skill

## Phạm vi ghi
- CHỈ `modules/<name>/domain/` (entity, value-object, domain-error).
- Không ghi ở application/, infrastructure/, shared/.

## Phạm vi đọc
Không giới hạn — nhưng thường chỉ cần đọc domain hiện có + (nếu chạy trong 1 chunk
của `full-feature`) phần mô tả use-case sắp dùng entity này để suy luận method cần
thiết.

## Bước 0 — Đọc constitution
Đọc `.claude/docs/architecture/constitution.md`, mục "Domain method/error policy" và
naming convention. Nếu thiếu/mơ hồ, dừng lại và yêu cầu chạy skill `constitution`
trước.

## Nguyên tắc cốt lõi — KHÔNG tự ý sinh thêm method/error
Domain layer là nơi dễ bị AI "over-engineer" nhất (sinh method "cho đầy đủ" dù
chưa cần). Skill này BẮT BUỘC theo quy trình tương tác dưới đây, không được bỏ
qua kể cả khi nghĩ mình biết rõ cần gì.

## Quy trình (mini-gate tương tác)

### Trường hợp entity đã tồn tại
1. Đọc entity hiện có.
2. Nếu task hiện tại không cần method/error mới ngoài những gì đã có → báo "domain
   đã đủ, không cần sửa" và dừng, không đụng vào file.
3. Nếu cần thêm → đi tiếp bước dưới, chỉ áp dụng cho phần thêm mới (không viết lại
   toàn bộ entity).

### Trường hợp entity chưa tồn tại (hoặc cần thêm mới)
1. **Hỏi dev baseline trước** — yêu cầu dev liệt kê:
   - Tên entity/value-object/domain-error cần tạo
   - Field cơ bản
   - Method cơ bản (nếu dev đã biết rõ)
   Không tự đoán baseline thay dev.
2. **AI suggest thêm** (dựa trên baseline dev cung cấp + use-case sắp dùng entity
   này, nếu có trong ngữ cảnh hiện tại — vd đang chạy trong 1 chunk của
   `full-feature`):
   - Method còn thiếu để phục vụ đúng use-case đang cần (kèm lý do: "cần method X
     vì use-case Y sẽ gọi").
   - Domain-error cần có (kèm lý do: tình huống nào ném lỗi này).
   - KHÔNG suggest method/error không có lý do cụ thể gắn với use-case/nhu cầu
     hiện tại — nếu không có gì để suggest, nói rõ "không cần thêm gì ngoài
     baseline".
3. **Dev confirm/reject từng suggestion** (không phải confirm cả cụm) — chỉ ghi
   code sau khi có xác nhận rõ ràng.
4. Ghi code: entity/VO/domain-error, tuân theo constitution.
   - Entity KHÔNG được chứa ORM decorator (TypeORM...), KHÔNG import bất kỳ
     package ngoài nào.
   - Domain-error extend base class định nghĩa trong `shared/errors/` (theo
     constitution).

## Sau khi ghi code — Self-review checklist

```
✅ Self-review checklist — Domain
[ ] Method/error đã tạo đúng khớp với danh sách đã được dev confirm (không dư)
[ ] Entity không có decorator của ORM hay bất kỳ package ngoài nào
[ ] Domain-error extend đúng base error class theo constitution
[ ] Value-object là immutable, có validate ở constructor
[ ] Không có logic thuộc infrastructure (không mapping DTO, không gọi DB)
```

## Out-of-scope
Nếu phát hiện cần thứ ngoài domain/ (vd cần port để lưu entity) → không tự tạo,
báo theo format tại `.claude/docs/architecture/out-of-scope-format.md`, trỏ sang skill
`use-case`.
