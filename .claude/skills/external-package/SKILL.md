---
name: external-package
description: Cài đặt và wrap 1 package/SDK bên ngoài (typeorm, swagger, redis, http client, message queue...) vào folder shared/ trước khi bất kỳ layer nào khác được dùng nó, kèm theo các utils/helper (function, custom decorator) cần thiết để tiêu thụ chính package đó. PHẢI dùng skill này khi cần "cài package mới", "thêm thư viện X vào project", "config package Y". KHÔNG dùng skill này để tạo use-case/port dùng package đó (đó là skill use-case) — skill này chỉ chuẩn bị package sẵn sàng để dùng.
---

# External-package Skill

## Phạm vi ghi
- `shared/` (wrapper, config factory, utils/helper phục vụ chính package đó).
- `app.module.ts` — CHỈ khi package cần global registration (interceptor,
  middleware toàn app). Đây là file dùng chung, được phép sửa.
- KHÔNG ghi vào `modules/<name>/application/` hay bất kỳ đâu ngoài `shared/` —
  kể cả khi biết rõ package này sẽ dùng cho use-case nào đó.

## Phạm vi đọc
Không giới hạn.

## Bước 0 — Đọc constitution
Đọc mục "Tech stack cố định & external package policy" tại
`.claude/docs/architecture/constitution.md`. Nếu package sắp thêm không nằm trong tech
stack đã chốt, dừng lại hỏi dev xác nhận trước khi cài (tránh thêm dependency
ngoài kế hoạch).

## Quy trình

1. Cài package (package.json).
2. Tạo wrapper trong `shared/` — bọc lại API gốc của package thành interface/
   function nội bộ project dùng, KHÔNG để chỗ khác import thẳng package gốc.
3. Tạo utils/helper cần thiết để tiêu thụ package (ví dụ: custom decorator dựa
   trên decorator gốc, retry wrapper, config factory đọc từ `configs/`). Những
   utils này CHỈ phục vụ việc dùng package, KHÔNG phải use-case/port/business
   logic.
4. Nếu package cần đăng ký global (interceptor, middleware...) → đăng ký ở
   `app.module.ts`.
5. KHÔNG tạo module, use-case, port nào dùng package này — dừng lại ở đây.

## Sau khi ghi code — Self-review checklist

```
✅ Self-review checklist — External Package
[ ] Package chỉ được import trực tiếp trong shared/, không nơi nào khác
[ ] Wrapper che giấu đủ chi tiết của package (nếu đổi package sau này, chỉ cần
    sửa trong shared/)
[ ] Utils/helper tạo ra chỉ phục vụ việc dùng package (không lẫn business logic)
[ ] Config đọc từ configs/, không hard-code giá trị nhạy cảm
[ ] Nếu có global registration, đã đăng ký đúng ở app.module.ts
```

## Out-of-scope
Dùng format tại `.claude/docs/architecture/out-of-scope-format.md`. Trường hợp phổ biến:
> "Package X đã sẵn sàng ở shared/. Cần dùng nó trong use-case Y (module Z) —
> chạy skill use-case với prompt: '...'"
→ luôn trỏ sang `use-case` (nếu cần business logic dùng package) hoặc
`infrastructure` (nếu cần adapter dùng package cho 1 port đã có).
