---
name: constitution
description: Tạo hoặc cập nhật file "constitution" (.claude/docs/architecture/constitution.md) — quy ước KỸ THUẬT/KIẾN TRÚC cố định của project Hexagonal + NestJS (layer boundary, naming, DI token, error convention, folder structure, tech stack). KHÔNG liên quan business logic. PHẢI dùng skill này khi: setup skill system lần đầu cho project, khi đổi convention kỹ thuật, hoặc khi bất kỳ skill nào khác phát hiện constitution.md còn thiếu/mơ hồ một mục cần thiết để tiếp tục code. Đây là skill DUY NHẤT được phép ghi vào .claude/docs/architecture/constitution.md.
---

# Constitution Skill

## Phạm vi ghi (DUY NHẤT)
- `.claude/docs/architecture/constitution.md`

Không ghi bất kỳ file code nào khác. Skill này không sinh business code.

## Vai trò
Đây là nguồn sự thật kỹ thuật duy nhất mà TẤT CẢ skill khác (`domain`, `use-case`,
`infrastructure`, `doc`, `external-package`, `config-env`, `full-feature`) bắt buộc
đọc trước khi Plan hoặc code. Không skill nào khác được tự ý bịa convention khi
constitution chưa nói rõ — nếu thiếu, phải quay lại chạy skill này trước.

## Quy trình

### Lần đầu setup (constitution.md chưa có / còn trống)
1. Đọc codebase hiện có (nếu project không phải mới tinh) để phát hiện convention
   đang dùng thực tế (naming, cấu trúc folder, ORM, validation lib...) — tránh hỏi
   lại cái đã có sẵn trong code.
2. Phỏng vấn dev lần lượt theo từng mục còn thiếu trong template
   (`.claude/docs/architecture/constitution.md`), tối đa 1 câu hỏi/lượt, ưu tiên câu có sẵn
   gợi ý từ bước 1 để dev chỉ cần xác nhận thay vì gõ từ đầu:
   - Naming convention (file/class/port/adapter/DI token/DTO)
   - Response envelope format (JSON response chuẩn thành công/lỗi)
   - Validation pipe dùng gì
   - Vị trí global exception filter (đường dẫn cụ thể, để skill `doc` trace tới)
   - Vị trí global interceptor (nếu có)
   - Tech stack cố định (ORM, config lib...)
   - Test convention (vị trí file test, coverage tối thiểu, bắt buộc test gì)
3. Ghi đầy đủ vào `.claude/docs/architecture/constitution.md`, thay các block `<!-- Điền -->`
   bằng nội dung thật.
4. In tóm tắt toàn bộ constitution vừa tạo để dev review lần cuối trước khi các
   skill khác bắt đầu dùng nó.

### Cập nhật (constitution.md đã có)
1. Hỏi rõ: đổi mục nào, lý do.
2. Cảnh báo nếu thay đổi này ảnh hưởng ngược tới code đã tồn tại (vd đổi response
   envelope format sẽ ảnh hưởng mọi endpoint đã có) — liệt kê rủi ro, không tự sửa
   code cũ (việc đó không thuộc scope của skill này, đưa vào phần suggestion theo
   `.claude/docs/architecture/out-of-scope-format.md`).
3. Ghi thay đổi, giữ nguyên các mục không liên quan.

### Khi được gọi "giữa chừng" bởi skill khác (thiếu 1 mục cụ thể)
1. Chỉ hỏi đúng mục đang thiếu, không phỏng vấn lại toàn bộ.
2. Ghi bổ sung đúng mục đó.
3. Trả lại quyền điều khiển cho skill/orchestration đã gọi nó.

## Nguyên tắc nội dung (nhắc lại khi phỏng vấn)
- Chỉ technical, KHÔNG được lẫn business rule của module/feature cụ thể nào.
- Domain method/error policy: mặc định YAGNI — method/error chỉ tạo khi phục vụ
  use-case đang implement, không suy đoán tương lai (chi tiết vận hành ở skill
  `domain`, nhưng rule gốc ghi tại đây).
- Mặc định KHÔNG dùng facade cho cross-module; dùng token + interface qua
  `public-api.ts`. Facade chỉ là ngoại lệ có lý do rõ ràng.
