---
name: scope-application
description: Giới hạn code chỉ trong application layer + module wiring file, phần còn lại liệt kê ra để CR chỉ đạo. Dùng khi user gọi /scope-application hoặc yêu cầu "chỉ code application".
---

# /scope-application

Kích hoạt xong, mọi thay đổi code CHỈ giới hạn trong:

- `src/modules/<name>/application/**` (use-case, application service, DTO, mapper, port dùng ở tầng application...)
- `src/modules/<name>/<name>.module.ts` (chỉ phần khai báo/wiring: import, providers array, export — không viết logic nghiệp vụ tại đây)

Cấm động vào: `domain/**`, `infrastructure/**`, `shared/**`, file khác ngoài 2 mục trên — kể cả tạo file phụ trợ, test...

Application chỉ được phụ thuộc domain qua interface/port có sẵn — nếu port/entity/domain error cần thiết chưa tồn tại, KHÔNG tự tạo trong domain, ghi nhận lại report mục CR.

## Quy trình

1. Đọc task, tách phần thuộc application (use-case, application service, DTO, mapper) ra khỏi phần còn lại (domain entity/port/error, controller, adapter/repository impl...).
2. Chỉ code phần application + module wiring.
3. Phần ngoài scope KHÔNG code, không tạo file — chỉ ghi nhận lại để report mục CR.
4. Nếu task hoàn toàn ngoài scope (không có phần application nào) — báo ngay, không code, chỉ trả mục 2 (CR).

## Report format (bắt buộc, cuối task)

```
1. Coding:
- <file path>: <mô tả, tối đa 20 từ>

2. CR:
- <file path>: <lệnh cần làm tiếp, tối đa 50 từ, dạng ra lệnh, không diễn giải chi tiết>
```

Mục 2 viết dạng ra lệnh, ví dụ: "tạo domain error InvalidAccountState", "hãy update mapper AccountMapper", "tạo port IAccountRepository", "tạo adapter AccountRepository (Prisma)". Không giải thích lý do, không mô tả chi tiết implementation.

Không xuất nội dung nào ngoài 2 mục report trên sau khi code xong.
