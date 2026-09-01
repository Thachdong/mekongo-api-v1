---
name: use-case
description: Tạo hoặc sửa use-case, port (interface), DI token trong application layer của 1 module NestJS Hexagonal — bao gồm quyết định có cần port/adapter không, có cần dùng use-case của module khác không, và export use-case qua public-api.ts nếu cần. PHẢI dùng skill này khi cần "làm rõ 1 tính năng/feature cần business logic gì", tạo interface cho use-case, hoặc khi cần gọi 1 use-case từ module khác. KHÔNG dùng để tạo controller/DTO/adapter (đó là skill infrastructure) hay entity (đó là skill domain).
---

# Use-case Skill

## Phạm vi ghi
- `modules/<name>/application/` (use-case class, port interface, DI token).
- `modules/<name>/application/public-api.ts` — CHỈ tạo/sửa khi module này thực sự
  có use-case cần export ra module khác (không tạo mặc định).

## Phạm vi đọc
Không giới hạn.

## Bước 0 — Đọc constitution
Đọc `docs/architecture/constitution.md` — đặc biệt mục layer boundary, cross-module
composition (mặc định KHÔNG facade), naming DI token.

## Quy trình

### 1. Làm rõ yêu cầu (Plan mini trước khi code)
Trước khi viết code, xác định và trình bày rõ:
- Use-case này làm gì (input → output, 1 business flow duy nhất, không gộp 2
  nghiệp vụ khác nhau vào 1 use-case).
- **Có cần port không?** Cần nếu use-case phải phụ thuộc 1 khả năng bên ngoài domain
  thuần (persist, gọi service ngoài, gửi message...). Nếu chỉ thao tác thuần domain
  object đã có sẵn trong tay → không cần port.
- **Nếu cần port**: định nghĩa interface (tên, method signature) tại đây. KHÔNG tự
  implement adapter — đó là việc của skill `infrastructure`. Sau khi định nghĩa
  xong, đưa vào out-of-scope suggestion trỏ sang `infrastructure`.
- **Có cần dùng use-case của module khác không?** Nếu có: chỉ được import qua
  `modules/<other>/application/public-api.ts` (token + interface), TUYỆT ĐỐI
  không import thẳng class/file nội bộ của module khác.
- **Facade?** Mặc định KHÔNG dùng. Chỉ cân nhắc nếu cần compose ≥ 2 use-case thành
  1 lời gọi duy nhất và có lý do rõ ràng — nếu vậy, dừng lại và hỏi dev xác nhận
  trước khi tạo facade (đây là ngoại lệ, không phải luồng mặc định).
- Nếu entity/domain-error cần thiết chưa tồn tại → dừng, đưa vào out-of-scope
  suggestion trỏ sang skill `domain` (không tự tạo domain tại đây).

### 2. Viết code
- Use-case class trong `modules/<name>/application/use-cases/`.
- Port interface trong `modules/<name>/application/ports/` (nếu cần).
- DI token: 1 token riêng cho mỗi use-case cần export (theo naming convention
  trong constitution), khai báo cùng chỗ với interface.

### 3. Export (nếu cần dùng từ module khác)
- Tạo/cập nhật `modules/<name>/application/public-api.ts`.
- CHỈ export: token, interface, type (input/output DTO nếu consumer cần biết).
- TUYỆT ĐỐI không export class implementation.
- Chỉ export use-case đã được xác định rõ là cần dùng ngoài module (không export
  "cho chắc").

## Sau khi ghi code — Self-review checklist

```
✅ Self-review checklist — Use Case
[ ] Use case chỉ implement đúng 1 business flow (không gộp 2 nghiệp vụ)
[ ] Input/Output không leak entity domain trực tiếp ra ngoài application layer
[ ] Port (nếu có) là interface thuần, không phụ thuộc SDK/package cụ thể nào
[ ] Không import trực tiếp SDK/package ngoài (phải qua port + adapter)
[ ] Cross-module (nếu có): chỉ import qua public-api.ts của module khác, không
    import file nội bộ
[ ] Không tự tạo facade trừ khi đã được dev xác nhận là ngoại lệ có lý do
[ ] public-api.ts (nếu có) chỉ export token/interface/type, không export class
[ ] Exception ném ra là domain-error, không phải lỗi kỹ thuật (DB, HTTP...)
```

## Out-of-scope
Dùng format tại `docs/architecture/out-of-scope-format.md`. Các trường hợp
thường gặp:
- Cần entity/domain-error mới → trỏ sang `domain`.
- Cần implement adapter cho port vừa định nghĩa → trỏ sang `infrastructure`.
- Cần package ngoài chưa được wrap ở shared/ → trỏ sang `external-package`.
