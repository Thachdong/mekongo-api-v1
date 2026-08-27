---
name: scope-domain
description: Giới hạn code chỉ trong domain layer + module wiring file, phần còn lại liệt kê ra để CR chỉ đạo. Dùng khi user gọi /scope-domain hoặc yêu cầu "chỉ code domain".
---

# /scope-domain

Kích hoạt xong, mọi thay đổi code CHỈ giới hạn trong:

- `src/modules/<name>/domain/**` (entity, value object, domain service, repository interface/port, domain error...)
- `src/modules/<name>/<name>.module.ts` (chỉ phần khai báo/wiring: import, providers array, export — không viết logic nghiệp vụ tại đây)

Cấm động vào: `application/**`, `infrastructure/**`, `shared/**`, file khác ngoài 2 mục trên — kể cả tạo file phụ trợ, test, DTO...

## Quy trình

1. Đọc task, tách phần thuộc domain (entity/VO/domain service/port) và phần wiring module ra khỏi phần còn lại (use-case, controller, adapter, DTO, provider binding cụ thể...).
2. Chỉ code phần domain + module wiring.
3. Phần ngoài scope KHÔNG code, không tạo file — chỉ ghi nhận lại để report mục CR.
4. Nếu task hoàn toàn ngoài scope (không có phần domain nào) — báo ngay, không code, chỉ trả mục 2 (CR).

## Report format (bắt buộc, cuối task)

```
1. Coding:
- <file path>: <mô tả, tối đa 20 từ>

2. CR:
- <file path>: <lệnh cần làm tiếp, tối đa 50 từ, dạng ra lệnh, không diễn giải chi tiết>
```

Mục 2 viết dạng ra lệnh, ví dụ: "tạo use-case CreateAccount", "tạo port IAccountRepository", "bind IAccountRepository trong account.module.ts", "tạo adapter AccountRepository (Prisma)". Không giải thích lý do, không mô tả chi tiết implementation.

Không xuất nội dung nào ngoài 2 mục report trên sau khi code xong.
