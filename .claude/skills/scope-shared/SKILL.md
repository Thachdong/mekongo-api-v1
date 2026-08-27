---
name: scope-shared
description: Giới hạn code chỉ trong shared kernel/common/infrastructure + root app.module.ts, phần còn lại liệt kê ra để CR chỉ đạo. Dùng khi user gọi /scope-shared hoặc yêu cầu "chỉ code shared".
---

# /scope-shared

Kích hoạt xong, mọi thay đổi code CHỈ giới hạn trong:

- `src/shared/**` (`kernel/` — domain primitive dùng chung; `common/` — decorator/pipe/guard/filter dùng chung; `infrastructure/` — base repository, DB connection, client dùng chung)
- `src/app.module.ts` (chỉ phần khai báo/wiring: import, module list, global providers — không viết logic nghiệp vụ tại đây)

Cấm động vào: `src/modules/<name>/domain/**`, `application/**`, `infrastructure/**`, `<name>.module.ts` của từng module — kể cả tạo file phụ trợ, test...

Shared chỉ chứa thứ dùng chung ≥2 module hoặc hạ tầng root-level — không viết logic riêng của 1 module cụ thể tại đây; nếu phát hiện việc thuộc về module riêng, ghi nhận lại report mục CR thay vì code.

## Quy trình

1. Đọc task, tách phần thuộc shared (kernel/common/infrastructure dùng chung) + root wiring ra khỏi phần còn lại (logic riêng từng module: domain/application/infrastructure/module.ts).
2. Chỉ code phần shared + app.module.ts wiring.
3. Phần ngoài scope KHÔNG code, không tạo file — chỉ ghi nhận lại để report mục CR.
4. Nếu task hoàn toàn ngoài scope (không có phần shared nào) — báo ngay, không code, chỉ trả mục 2 (CR).

## Report format (bắt buộc, cuối task)

```
1. Coding:
- <file path>: <mô tả, tối đa 20 từ>

2. CR:
- <file path>: <lệnh cần làm tiếp, tối đa 50 từ, dạng ra lệnh, không diễn giải chi tiết>
```

Mục 2 viết dạng ra lệnh, ví dụ: "tạo use-case CreateAccount", "tạo port IAccountRepository", "tạo entity Account", "bind provider trong account.module.ts". Không giải thích lý do, không mô tả chi tiết implementation.

Không xuất nội dung nào ngoài 2 mục report trên sau khi code xong.
