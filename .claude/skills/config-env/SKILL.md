---
name: config-env
description: Tạo hoặc sửa cấu hình environment/config của project trong folder configs/ (schema biến môi trường, validate config, config module). PHẢI dùng skill này khi cần "thêm biến env mới", "config cho package X đọc từ env", "setup config module". KHÔNG chứa business logic hay biết chi tiết SDK cụ thể (đó là việc của shared/, xem skill external-package).
---

# Config-env Skill

## Phạm vi ghi
- CHỈ `/configs`.

## Phạm vi đọc
Không giới hạn.

## Bước 0 — Đọc constitution
Đọc mục tech stack / config lib đã chốt tại `.claude/docs/architecture/constitution.md`.

## Quy trình
1. Xác định biến env cần thêm (tên, kiểu, bắt buộc/optional, giá trị mặc định nếu
   có).
2. Thêm vào schema validate env (theo lib đã chốt trong constitution — vd Joi,
   class-validator...). Không được để biến env không có validate.
3. Expose qua config module/service theo pattern hiện có trong `configs/` (không
   đổi pattern nếu project đã có sẵn convention).
4. Cập nhật `.env.example` (nếu project có dùng) để dev khác biết cần set gì.

## Sau khi ghi code — Self-review checklist

```
✅ Self-review checklist — Config
[ ] Biến env mới có validate (type, required/optional)
[ ] Không hard-code secret/giá trị nhạy cảm trong code
[ ] .env.example đã cập nhật (nếu có dùng)
[ ] Config expose qua service/module đúng pattern hiện có, không tạo pattern mới
    song song
```

## Out-of-scope
Nếu config này thực ra phục vụ 1 package cụ thể chưa được wrap ở `shared/` →
dùng format tại `.claude/docs/architecture/out-of-scope-format.md`, trỏ sang
`external-package`.
