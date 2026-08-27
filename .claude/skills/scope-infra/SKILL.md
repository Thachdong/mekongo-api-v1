---
name: scope-infra
description: Giới hạn code chỉ trong infrastructure layer + module wiring file, phần còn lại liệt kê ra để CR chỉ đạo. Dùng khi user gọi /scope-infra hoặc yêu cầu "chỉ code infra".
---

# /scope-infra

Kích hoạt xong, mọi thay đổi code CHỈ giới hạn trong:

- `src/modules/<name>/infrastructure/**` (controller, repository/adapter implementation, external service client, framework glue...)
- `src/modules/<name>/<name>.module.ts` (chỉ phần khai báo/wiring: import, providers array [`provide: IPort, useClass: Adapter`], export — không viết logic nghiệp vụ tại đây)

Cấm động vào: `domain/**`, `application/**`, `shared/**`, file khác ngoài 2 mục trên — kể cả tạo file phụ trợ, test...

Infrastructure chỉ implement port có sẵn từ domain — nếu port/use-case/entity cần thiết chưa tồn tại, KHÔNG tự tạo trong domain/application, ghi nhận lại report mục CR.

## Quy trình

1. Đọc task, tách phần thuộc infrastructure (adapter, repository impl, controller, external client) ra khỏi phần còn lại (use-case, port, entity, mapper application...).
2. Chỉ code phần infrastructure + module wiring.
3. Phần ngoài scope KHÔNG code, không tạo file — chỉ ghi nhận lại để report mục CR.
4. Nếu task hoàn toàn ngoài scope (không có phần infrastructure nào) — báo ngay, không code, chỉ trả mục 2 (CR).

## Report format (bắt buộc, cuối task)

```
1. Coding:
- <file path>: <mô tả, tối đa 20 từ>

2. CR:
- <file path>: <lệnh cần làm tiếp, tối đa 50 từ, dạng ra lệnh, không diễn giải chi tiết>
```

Mục 2 viết dạng ra lệnh, ví dụ: "tạo use-case CreateAccount", "tạo port IAccountRepository", "tạo entity Account", "update mapper AccountMapper". Không giải thích lý do, không mô tả chi tiết implementation.

Không xuất nội dung nào ngoài 2 mục report trên sau khi code xong.
