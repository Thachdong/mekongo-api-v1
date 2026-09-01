---
name: infrastructure
description: Tạo hoặc sửa code trong infrastructure layer của 1 module NestJS Hexagonal — controller method, request/response DTO tham chiếu đến use-case có sẵn, VÀ implement adapter cho port đã định nghĩa (TypeORM repository, HTTP client caller, cache adapter...). PHẢI dùng skill này khi cần "tạo endpoint", "tạo API", "implement port/adapter". KHÔNG dùng để tạo use-case mới (skill use-case) hay wrap package ngoài lần đầu (skill external-package) hay sinh swagger decorator (skill doc).
---

# Infrastructure Skill

## Phạm vi ghi
- `modules/<name>/infrastructure/` — controller, DTO, adapter, TypeORM
  entity/repository impl.
- KHÔNG ghi `*.decorators.ts` (thuộc skill `doc`).

## Phạm vi đọc
Không giới hạn.

## Bước 0 — Đọc constitution
Đọc `docs/architecture/constitution.md` — DTO/validation/response convention,
naming adapter, error mapping.

## Hai loại việc skill này xử lý

### A. Implement adapter (cho port đã có)
1. Đọc port interface trong `application/ports/`.
2. Kiểm tra `shared/` đã có wrapper cho package cần dùng chưa (vd TypeORM
   DataSource, Redis client). Nếu CHƯA có → dừng, đưa vào out-of-scope suggestion
   trỏ sang `external-package`, không tự import SDK trực tiếp vào adapter.
3. Viết adapter class implement đúng port interface, dùng wrapper từ `shared/`.
   Adapter là nơi DUY NHẤT được biết chi tiết kỹ thuật của package cụ thể — không
   để rò rỉ type/exception riêng của package ra khỏi adapter (phải convert sang
   domain-error nếu cần ném lỗi).
4. Đăng ký adapter vào DI container tại `modules/<name>/<name>.module.ts` (file
   dùng chung, được phép sửa) — bind đúng token của port.

### B. Tạo endpoint (controller method)
1. Đọc use-case cần dùng qua `public-api.ts` của chính module (hoặc trực tiếp
   trong module nếu không cross-module). Nếu use-case CHƯA tồn tại → dừng, đưa
   vào out-of-scope suggestion trỏ sang `use-case`, không tự viết logic nghiệp vụ
   trong controller.
2. Tạo request DTO (dùng validation lib theo constitution) và response DTO.
3. Viết controller method: chỉ orchestrate — validate input (qua DTO), gọi
   use-case, map domain object → response DTO. KHÔNG chứa business logic.
4. Mapping domain → response DTO: không bao giờ trả thẳng entity domain ra
   response.

## Sau khi ghi code — Self-review checklist

```
✅ Self-review checklist — Infrastructure
[ ] Adapter implement đúng 100% signature của port (không thêm/bớt method)
[ ] Adapter là nơi duy nhất biết chi tiết SDK; không rò rỉ type/exception của SDK
    ra ngoài adapter
[ ] Adapter dùng wrapper từ shared/, không import SDK trực tiếp
[ ] Controller không chứa business logic, chỉ orchestrate + map
[ ] Request DTO có validate đầy đủ theo convention
[ ] Response DTO không leak entity domain / field nhạy cảm
[ ] Đăng ký DI đúng token trong module file
[ ] Không tự tạo use-case mới nếu thiếu — đã báo out-of-scope thay vì tự viết
```

## Out-of-scope
Dùng format tại `docs/architecture/out-of-scope-format.md`:
- Thiếu use-case → `use-case`
- Thiếu wrapper package ở shared/ → `external-package`
- Cần swagger doc cho endpoint vừa tạo → `doc`
